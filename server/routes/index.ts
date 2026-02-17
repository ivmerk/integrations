import { IRouter } from '../../../../src/core/server';
import { schema } from '@osd/config-schema';
import { Logger } from '../../../../src/core/server';
import {CONFIGURATION_FILES_PATH, DEVICES_INDEX} from "../../common/constants";
import {readFileContent} from "../../common/file_utils";
import {generateUlid} from "../utils/ulid";

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

        deps.logger.info(`Device created with uid=${uid}`);

        return response.ok({
          body: { uid },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        deps.logger.error(`Failed to create device: ${errorMessage}`, { error });

        return response.customError({
          statusCode: 500,
          body: {
            message: `Failed to create device: ${errorMessage}`,
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

        await client.delete({
          index: DEVICES_INDEX,
          id: uid,
          refresh: 'wait_for',
        });

        deps.logger.info(`Device deleted with uid=${uid}`);

        return response.ok({
          body: { message: `Device with uid=${uid} deleted` },
        });
      } catch (error) {
        const statusCode = (error as any)?.statusCode;

        if (statusCode === 404) {
          return response.customError({
            statusCode: 404,
            body: { message: `Device with uid=${request.query.uid} not found` },
          });
        }

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
