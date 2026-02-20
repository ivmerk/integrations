import { GROUP_NAME, SCOPD_RULES_FILE_NAME, SCOPD_DECODERS_FILE_NAME } from '../../common/constants';

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
  if (confFileContent.replace(/\s/g, '').includes(blockContent.replace(/\s/g, ''))) {
    return confFileContent;
  }
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

export function createWazuhApiClient(opts: WazuhApiClientOptions) {
  // Wazuh auth cookies captured from /api/login: wz-token, wz-user, wz-api
  let wazuhCookieString = '';

  function getCookieHeader(): string {
    return [opts.headers.cookie, wazuhCookieString].filter(Boolean).join('; ');
  }

  async function callApiRequest(wazuhMethod: string, path: string, body: object = {}): Promise<any> {
    const cookieHeader = getCookieHeader();
    const response = await fetch(`${opts.baseUrl}/api/request`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'osd-xsrf': 'true',
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({ body, id: GROUP_NAME, method: wazuhMethod, path }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Wazuh API [${wazuhMethod} ${path}]: ${response.status} ${text}`);
    }
    return response.json();
  }

  return {
    async login(): Promise<void> {
      const cookieHeader = getCookieHeader();
      const response = await fetch(`${opts.baseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'osd-xsrf': 'true',
          ...(cookieHeader ? { cookie: cookieHeader } : {}),
        },
        body: JSON.stringify({ idHost: 'default', force: true }),
      });
      // Capture Wazuh auth cookies (wz-token, wz-user, wz-api) from login response.
      // getSetCookie() returns each Set-Cookie header as a separate string (Node 18+).
      const headers = response.headers as any;
      const setCookies: string[] =
        typeof headers.getSetCookie === 'function' ? headers.getSetCookie() : [];
      if (setCookies.length > 0) {
        // Extract only the name=value part from each Set-Cookie (drop Path, HttpOnly, etc.)
        wazuhCookieString = setCookies
          .map((c: string) => c.split(';')[0].trim())
          .join('; ');
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
      const response = await fetch(`${opts.baseUrl}/api/request`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'osd-xsrf': 'true',
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
