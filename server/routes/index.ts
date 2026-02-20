import { IRouter } from '../../../../src/core/server';
import { schema } from '@osd/config-schema';
import { Logger } from '../../../../src/core/server';
import { access } from 'fs/promises';
import { join } from 'path';
import { CONFIGURATION_FILES_PATH, DEVICES_INDEX, SCOPD_OSSEC_CONF_FILE_NAME } from "../../common/constants";
import { readFileContent } from "../../common/file_utils";
import { generateUlid } from "../utils/ulid";
import { createWazuhApiClient, applyAllowedIps, injectOssecBlock, removeOssecRemoteBlock } from "../utils/wazuh-api";

interface RouteDependencies {
  logger: Logger;
}
interface IntegrationStatusAttributes {
  integration: string;
  enabled: boolean;
  updated_at?: string;
}

function isValidIpOrCidr(value: string): boolean {
  const cidrMatch = value.match(/^(.+)\/(\d+)$/);
  const ip = cidrMatch ? cidrMatch[1] : value;
  const prefix = cidrMatch ? Number(cidrMatch[2]) : null;

  // Validate IPv4
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  for (const part of parts) {
    const num = Number(part);
    if (!Number.isInteger(num) || num < 0 || num > 255 || part !== String(num)) return false;
  }

  // Validate CIDR prefix if present
  if (prefix !== null && (prefix < 0 || prefix > 32)) return false;

  return true;
}

export function defineRoutes(router: IRouter, deps: RouteDependencies) {

  router.get(
    { path: '/api/integrations/scopd/status', validate: false },
    async function handler (context, request, response)  {
     const savedObjectsClient = context.core.savedObjects.client;
     try {
       // First, try to get the saved object
       const obj = await savedObjectsClient.get<IntegrationStatusAttributes>('integration-status', 'scopd-status');
       return response.ok({
         body: {
           integration: obj.attributes.integration,
           enabled: obj.attributes.enabled,
           wazuhConnected: true
         },
       });
     } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
       deps.logger.error('Error message', { error: errorMessage });
       if ((error as any).output?.statusCode === 404) {
         return response.ok({
           body: {
             integration: 'scopd',
             enabled: false,
             wazuhConnected: false,
             error: 'No configuration found'
           },
         });
       }
       return response.customError({
         statusCode: 500,
         body: {
           message: `Failed to get status: ${errorMessage}`,
           attributes: {
             details: error
           }
         },
       });
     }
   }
  );
  router.post(
    {
      path: '/api/integrations/load-config-file',
      validate: {
        body: schema.object({
          configFileName: schema.maybe(schema.string())
        })
      }
    },
    async function handler(context, request, response) {
      interface UploadConfFileRequestBody {
        configFileName?: string | undefined;
      }

      const {configFileName} = request.body as UploadConfFileRequestBody;
      const configFilePath = `${CONFIGURATION_FILES_PATH}${configFileName}`
      let fileContent;
      try {
        deps.logger.info('Uploading configuration file from disk');
        fileContent = await readFileContent(configFilePath);

        return response.ok({
          body: {
            message: 'Rule uploaded successfully',
            fileContent,
            attributes: {
              fileName: configFileName
            }
          }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        deps.logger.error(`Failed to upload rule: ${errorMessage}`, {error});

        return response.customError({
          statusCode: 500,
          body: {
            message: `Failed to upload rule: ${errorMessage}`,
            attributes: {
              success: false,
              details: error instanceof Error ? error.toString() : String(error)
            }
          }
        });
      }
    }
  );

  // POST /api/integrations/device — Create a new device
  router.post(
    {
      path: '/api/integrations/device',
      validate: {
        body: schema.object({
          name: schema.string(),
          connection: schema.oneOf([schema.literal('syslog')], {
            defaultValue: 'syslog',
            meta: { description: 'Only "syslog" is supported' },
          }),
          groups_filter: schema.string(),
          allowed_ips: schema.maybe(schema.string({
            validate(value) {
              if (!isValidIpOrCidr(value)) {
                return 'allowed_ips must be a valid IP address or CIDR network';
              }
            },
          })),
          rules_file: schema.maybe(schema.string()),
          decoders_file: schema.maybe(schema.string()),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const { rules_file, decoders_file, allowed_ips } = request.body;

        // Validate that rules_file exists on disk
        if (rules_file) {
          const rulesPath = join(process.cwd(), CONFIGURATION_FILES_PATH, rules_file);
          try {
            await access(rulesPath);
          } catch {
            return response.badRequest({
              body: { message: `rules_file "${rules_file}" does not exist on the server` },
            });
          }
        }

        // Validate that decoders_file exists on disk
        if (decoders_file) {
          const decodersPath = join(process.cwd(), CONFIGURATION_FILES_PATH, decoders_file);
          try {
            await access(decodersPath);
          } catch {
            return response.badRequest({
              body: { message: `decoders_file "${decoders_file}" does not exist on the server` },
            });
          }
        }

        // Build Wazuh API client.
        // Use 127.0.0.1 explicitly — 'localhost' may resolve to ::1 (IPv6) on some systems
        // while the OSD server binds to 0.0.0.0 (IPv4 only), causing ECONNREFUSED.
        const host = request.headers.host as string;
        const port = host.includes(':') ? host.split(':')[1] : '5601';
        const rawCookie = request.headers.cookie;
        const wazuhHeaders: Record<string, string> = {};
        if (rawCookie) {
          wazuhHeaders.cookie = Array.isArray(rawCookie) ? rawCookie.join('; ') : rawCookie;
        }
        const wazuhApi = createWazuhApiClient({ baseUrl: `http://127.0.0.1:${port}`, headers: wazuhHeaders });

        // Login to Wazuh Manager to ensure an active session
        deps.logger.info('Device create: logging in to Wazuh Manager');
        await wazuhApi.login();
        deps.logger.info('Device create: login OK');

        // Upload rules file to Wazuh Manager
        if (rules_file) {
          deps.logger.info(`Device create: uploading rules file ${rules_file}`);
          const rulesContent = await readFileContent(`${CONFIGURATION_FILES_PATH}${rules_file}`);
          try {
            await wazuhApi.uploadRulesFile(rulesContent);
            deps.logger.info(`Device create: rules file uploaded`);
          } catch (uploadErr) {
            // Wazuh may return an XML validation warning even when the file is
            // successfully written to disk — treat this as a non-fatal warning.
            deps.logger.warn(`Device create: rules file upload warning (file written): ${(uploadErr as Error).message}`);
          }
        }

        // Upload decoders file to Wazuh Manager
        if (decoders_file) {
          deps.logger.info(`Device create: uploading decoders file ${decoders_file}`);
          const decodersContent = await readFileContent(`${CONFIGURATION_FILES_PATH}${decoders_file}`);
          try {
            await wazuhApi.uploadDecoderFile(decodersContent);
            deps.logger.info(`Device create: decoders file uploaded`);
          } catch (uploadErr) {
            deps.logger.warn(`Device create: decoders file upload warning (file written): ${(uploadErr as Error).message}`);
          }
        }

        // Read ossec.conf.xml template from disk
        deps.logger.info('Device create: reading ossec.conf.xml');
        let ossecBlock = await readFileContent(`${CONFIGURATION_FILES_PATH}${SCOPD_OSSEC_CONF_FILE_NAME}`);

        // Inject allowed_ips into the <allowed-ips> tag if provided; otherwise use template default
        if (allowed_ips) {
          ossecBlock = applyAllowedIps(ossecBlock, allowed_ips);
        }

        // Get current Wazuh Manager configuration, inject ossec block, and re-upload
        deps.logger.info('Device create: getting Wazuh Manager config');
        const confFileContent = await wazuhApi.getManagerConfig();
        deps.logger.info(`Device create: got config len=${confFileContent.length} start=${confFileContent.substring(0, 60).replace(/\n/g, ' ')}`);
        deps.logger.info('Device create: injecting ossec block and uploading config');
        const updatedConf = injectOssecBlock(confFileContent, ossecBlock);
        deps.logger.info(`Device create: uploading config len=${updatedConf.length}`);
        await wazuhApi.uploadManagerConfig(updatedConf);
        deps.logger.info('Device create: Wazuh Manager config updated');

        // Create device document in OpenSearch before restarting Wazuh Manager.
        // Restart is fired asynchronously so it does not block the response —
        // the Wazuh Manager restart can disrupt the OSD connection and prevent
        // the response from being sent if awaited here.
        const client = context.core.opensearch.client.asCurrentUser;
        const uid = generateUlid();
        const now = new Date().toISOString();

        const document = {
          uid,
          name: request.body.name,
          connection: request.body.connection,
          groups_filter: request.body.groups_filter,
          allowed_ips: request.body.allowed_ips ?? null,
          rules_file: request.body.rules_file ?? null,
          decoders_file: request.body.decoders_file ?? null,
          created_at: now,
        };

        await client.index({
          index: DEVICES_INDEX,
          id: uid,
          body: document,
          refresh: 'wait_for',
        });

        deps.logger.info(`Device create: indexed uid=${uid}, scheduling Wazuh Manager restart`);

        // Defer restart until after the response is sent — restartManager triggers a Wazuh Manager
        // process restart that can disrupt the OSD HTTP connection if initiated too early.
        setImmediate(() => {
          wazuhApi.restartManager().catch((err: Error) => {
            deps.logger.error(`Device create: Wazuh Manager restart failed: ${err.message}`, { err });
          });
        });

        return response.ok({
          body: { uid },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const cause = (error as any)?.cause;
        const causeMessage = cause instanceof Error ? ` (cause: ${cause.message})` : '';
        deps.logger.error(`Failed to create device: ${errorMessage}${causeMessage}`, { error });

        return response.customError({
          statusCode: 500,
          body: {
            message: `Failed to create device: ${errorMessage}${causeMessage}`,
            attributes: { details: error instanceof Error ? error.toString() : String(error) },
          },
        });
      }
    }
  );

  // DELETE /api/integrations/device?uid={uid} — Delete a device by uid
  router.delete(
    {
      path: '/api/integrations/device',
      validate: {
        query: schema.object({
          uid: schema.string(),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const client = context.core.opensearch.client.asCurrentUser;
        const { uid } = request.query;

        // 1. Fetch device document to learn which files to remove
        deps.logger.info(`Device delete: fetching device uid=${uid}`);
        let device: any;
        try {
          const result = await client.get({ index: DEVICES_INDEX, id: uid });
          device = result.body._source;
        } catch (error) {
          if ((error as any)?.statusCode === 404) {
            return response.customError({
              statusCode: 404,
              body: { message: `Device with uid=${uid} not found` },
            });
          }
          throw error;
        }

        // 2. Build Wazuh API client and login
        const host = request.headers.host as string;
        const port = host.includes(':') ? host.split(':')[1] : '5601';
        const rawCookie = request.headers.cookie;
        const wazuhHeaders: Record<string, string> = {};
        if (rawCookie) {
          wazuhHeaders.cookie = Array.isArray(rawCookie) ? rawCookie.join('; ') : rawCookie;
        }
        const wazuhApi = createWazuhApiClient({ baseUrl: `http://127.0.0.1:${port}`, headers: wazuhHeaders });

        deps.logger.info('Device delete: logging in to Wazuh Manager');
        await wazuhApi.login();
        deps.logger.info('Device delete: login OK');

        // 3. Delete rules file from Wazuh Manager
        if (device.rules_file) {
          deps.logger.info(`Device delete: deleting rules file ${device.rules_file}`);
          await wazuhApi.deleteRulesFile(device.rules_file);
          deps.logger.info('Device delete: rules file deleted');
        }

        // 4. Delete decoders file from Wazuh Manager
        if (device.decoders_file) {
          deps.logger.info(`Device delete: deleting decoders file ${device.decoders_file}`);
          await wazuhApi.deleteDecoderFile(device.decoders_file);
          deps.logger.info('Device delete: decoders file deleted');
        }

        // 5. Remove the matching <remote> block from ossec.conf and re-upload
        deps.logger.info('Device delete: getting Wazuh Manager config');
        const confFileContent = await wazuhApi.getManagerConfig();
        deps.logger.info('Device delete: removing ossec remote block and uploading config');
        const updatedConf = removeOssecRemoteBlock(confFileContent, device.connection);
        await wazuhApi.uploadManagerConfig(updatedConf);
        deps.logger.info('Device delete: Wazuh Manager config updated');

        // 6. Delete document from OpenSearch
        await client.delete({
          index: DEVICES_INDEX,
          id: uid,
          refresh: 'wait_for',
        });
        deps.logger.info(`Device delete: document removed uid=${uid}, scheduling restart`);

        // 7. Defer restart until after the response is sent
        setImmediate(() => {
          wazuhApi.restartManager().catch((err: Error) => {
            deps.logger.error(`Device delete: Wazuh Manager restart failed: ${err.message}`, { err });
          });
        });

        // 8. Return 200
        return response.ok({ body: { message: 'Device deleted successfully' } });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        deps.logger.error(`Failed to delete device: ${errorMessage}`, { error });

        return response.customError({
          statusCode: 500,
          body: {
            message: `Failed to delete device: ${errorMessage}`,
            attributes: { details: error instanceof Error ? error.toString() : String(error) },
          },
        });
      }
    }
  );

  // GET /api/integrations/device — Get one device by uid, or all devices
  router.get(
    {
      path: '/api/integrations/device',
      validate: {
        query: schema.object({
          uid: schema.maybe(schema.string()),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const client = context.core.opensearch.client.asCurrentUser;
        const { uid } = request.query;

        if (uid) {
          const result = await client.get({ index: DEVICES_INDEX, id: uid });
          return response.ok({ body: result.body._source });
        }

        // Return all devices
        const result = await client.search({
          index: DEVICES_INDEX,
          body: { query: { match_all: {} } },
          size: 10000,
        });

        const devices = result.body.hits.hits.map((hit: any) => hit._source);
        return response.ok({ body: devices });
      } catch (error) {
        const statusCode = (error as any)?.statusCode;

        if (statusCode === 404) {
          // Index or document not found
          const { uid } = request.query;
          if (uid) {
            return response.customError({
              statusCode: 404,
              body: { message: `Device with uid=${uid} not found` },
            });
          }
          // Index doesn't exist yet — return empty array
          return response.ok({ body: [] });
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        deps.logger.error(`Failed to get device(s): ${errorMessage}`, { error });

        return response.customError({
          statusCode: 500,
          body: {
            message: `Failed to get device(s): ${errorMessage}`,
            attributes: { details: error instanceof Error ? error.toString() : String(error) },
          },
        });
      }
    }
  );

}
