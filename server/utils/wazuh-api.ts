import https from 'https';
import http from 'http';
import { URL } from 'url';
import { GROUP_NAME, SCOPD_RULES_FILE_NAME, SCOPD_DECODERS_FILE_NAME } from '../../common/constants';

// Loopback self-calls go to OSD's own HTTPS endpoint which uses a self-signed
// certificate. Use https.request directly with rejectUnauthorized:false so we
// skip verification only for these internal calls.
const loopbackHttpsAgent = new https.Agent({ rejectUnauthorized: false });

interface InternalResponse {
  ok: boolean;
  status: number;
  text(): Promise<string>;
  json(): Promise<any>;
  headers: { getSetCookie(): string[] };
}

function internalFetch(
  url: string,
  options: { method: string; headers: Record<string, string>; body?: string }
): Promise<InternalResponse> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === 'https:';
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: options.method,
      headers: options.headers,
      agent: isHttps ? loopbackHttpsAgent : undefined,
    };
    const mod = isHttps ? https : http;
    const req = mod.request(reqOptions, (res) => {
      const setCookies = (res.headers['set-cookie'] || []) as string[];
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk; });
      res.on('end', () => {
        const status = res.statusCode ?? 0;
        resolve({
          ok: status >= 200 && status < 300,
          status,
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data)),
          headers: { getSetCookie: () => setCookies },
        });
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

interface WazuhApiClientOptions {
  baseUrl: string;
  headers: Record<string, string>;
}

export function applyAllowedIps(ossecTemplate: string, allowedIps: string): string {
  return ossecTemplate.replace(
    /<allowed-ips>[^<]*<\/allowed-ips>/,
    `<allowed-ips>${allowedIps}</allowed-ips>`
  );
}

export function removeOssecRemoteBlock(confFileContent: string, connectionType: string): string {
  return confFileContent.replace(
    /(\n?[ \t]*<remote>[\s\S]*?<\/remote>)/g,
    (match) => {
      if (match.includes(`<connection>${connectionType}</connection>`)) {
        return '';
      }
      return match;
    }
  );
}

export function injectOssecBlock(confFileContent: string, blockContent: string): string {
  const tagStart = confFileContent.indexOf('<ossec_config>');
  if (tagStart === -1) {
    throw new Error('Could not find <ossec_config> tag in ossec.conf');
  }
  const insertAt = confFileContent.indexOf('>', tagStart) + 1;
  const lineStart = confFileContent.lastIndexOf('\n', insertAt) + 1;
  const indent = confFileContent
    .substring(lineStart, confFileContent.indexOf('<', lineStart))
    .replace(/[^ \t]/g, '');
  const before = confFileContent.substring(0, insertAt);
  const after = confFileContent.substring(insertAt);
  return `${before}\n${indent}${blockContent.trim().replace(/\n/g, `\n${indent}`)}${after}`;
}

function parseCookieString(cookieStr: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const pair of cookieStr.split(';')) {
    const trimmed = pair.trim();
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      map.set(trimmed.substring(0, eq).trim(), trimmed.substring(eq + 1));
    }
  }
  return map;
}

function applyCookieOverrides(base: string, setCookieHeaders: string[]): string {
  const map = parseCookieString(base);
  for (const header of setCookieHeaders) {
    const nameValue = header.split(';')[0].trim();
    const eq = nameValue.indexOf('=');
    if (eq > 0) {
      map.set(nameValue.substring(0, eq).trim(), nameValue.substring(eq + 1));
    }
  }
  return Array.from(map.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
}

export function createWazuhApiClient(opts: WazuhApiClientOptions) {
  // Active cookie string for all calls. Login may update this with a rotated
  // OSD session and fresh wz-* tokens — both must stay in sync.
  let activeCookies = opts.headers.cookie || '';

  function getCookieHeader(): string {
    return activeCookies;
  }

  async function callApiRequest(wazuhMethod: string, path: string, body: object = {}): Promise<any> {
    const cookieHeader = getCookieHeader();
    const response = await internalFetch(`${opts.baseUrl}/api/request`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'osd-xsrf': 'true',
        'id': GROUP_NAME,
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({ body, id: GROUP_NAME, method: wazuhMethod, path }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Wazuh API [${wazuhMethod} ${path}]: ${response.status} ${text}`);
    }
    const result = await response.json();
    // /api/request always returns HTTP 200, even when the Wazuh Manager rejects
    // the call with 4xx/5xx. Detect hard failures via the response body:
    // - result.error is truthy (non-zero Wazuh error code)
    // - AND total_affected_items === 0 (nothing was written/applied at all)
    // This avoids false positives where the operation succeeds on disk but Wazuh
    // returns a validation warning with error:1 (e.g. rule syntax warnings).
    if (result?.error && result?.data?.total_affected_items === 0) {
      throw new Error(
        `Wazuh API [${wazuhMethod} ${path}] rejected: ${result?.data?.failed_items?.[0]?.error?.message || result?.message || result?.detail || JSON.stringify(result)}`
      );
    }
    return result;
  }

  return {
    async login(): Promise<void> {
      const cookieHeader = getCookieHeader();
      const response = await internalFetch(`${opts.baseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'osd-xsrf': 'true',
          ...(cookieHeader ? { cookie: cookieHeader } : {}),
        },
        body: JSON.stringify({ idHost: 'default', force: true }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Wazuh login failed: ${response.status} ${text}`);
      }
      const setCookies = response.headers.getSetCookie();
      if (setCookies.length > 0) {
        // Merge login response cookies into activeCookies so that any rotated
        // OSD session token and fresh wz-* tokens replace the stale originals.
        // Same-named cookies appear only once (new value wins), preventing the
        // "old session ID sent first" problem that caused 401 on /api/request.
        activeCookies = applyCookieOverrides(activeCookies, setCookies);
      }
    },

    async uploadRulesFile(fileContent: string): Promise<void> {
      await callApiRequest('PUT', `/rules/files/${SCOPD_RULES_FILE_NAME}`, {
        body: fileContent,
        origin: 'raw',
        params: { overwrite: true, relative_dirname: 'etc/rules' },
      });
    },

    async uploadDecoderFile(fileContent: string): Promise<void> {
      await callApiRequest('PUT', `/decoders/files/${SCOPD_DECODERS_FILE_NAME}`, {
        body: fileContent,
        origin: 'raw',
        params: { overwrite: true, relative_dirname: 'etc/decoders' },
      });
    },

    async deleteRulesFile(filename: string): Promise<void> {
      await callApiRequest('DELETE', `/rules/files/${filename}`, {});
    },

    async deleteDecoderFile(filename: string): Promise<void> {
      await callApiRequest('DELETE', `/decoders/files/${filename}`, {});
    },

    async getManagerConfig(): Promise<string> {
      const cookieHeader = getCookieHeader();
      const response = await internalFetch(`${opts.baseUrl}/api/request`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'osd-xsrf': 'true',
          'id': GROUP_NAME,
          ...(cookieHeader ? { cookie: cookieHeader } : {}),
        },
        body: JSON.stringify({
          body: { params: { raw: true } },
          id: GROUP_NAME,
          method: 'GET',
          path: '/manager/configuration',
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to get manager config: ${response.status} ${text}`);
      }
      const text = await response.text();
      // The response may be raw XML or a JSON-encoded string
      try {
        const parsed = JSON.parse(text);
        return typeof parsed === 'string' ? parsed : text;
      } catch {
        return text;
      }
    },

    async uploadManagerConfig(content: string): Promise<void> {
      await callApiRequest('PUT', '/manager/configuration', {
        body: content,
        origin: 'raw',
      });
    },

    async restartManager(): Promise<void> {
      await callApiRequest('PUT', '/manager/restart', {});
    },
  };
}
