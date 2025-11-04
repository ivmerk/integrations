import { IRouter } from '../../../../src/core/server';
import { schema } from '@osd/config-schema';
import {
  authenticateWazuh, restartWazuhManager, uploadAgentConfToWazuhManager,
  uploadDecoderToWazuhManager, uploadGroupsAgentConfig,
  uploadRuleToWazuhManager
} from '../../common/fetch_wazuh_manager_sevice';
import { Logger } from '../../../../src/core/server';
import {CONFIGURATION_FILES_PATH} from "../../common/constants";
import {readFileContent} from "../../common/file_utils";

interface RouteDependencies {
  logger: Logger;
}
interface IntegrationStatusAttributes {
  integration: string;
  enabled: boolean;
  updated_at?: string;
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
 /* router.post(
    { path: '/api/integrations/wazuh/authenticate', validate: false },
    async (context, request, response) => {
      try {
        console.log('Authenticating with Wazuh API...');
        const token = await authenticateWazuh();
        console.log('Authentication successful');
        return response.ok({
          body: {
            success: true,
            token
          }
        });
      } catch (error) {
        console.error('Wazuh authentication error:', error);
        return response.customError({
          statusCode: 500,
          body: {
            message: error instanceof Error ? error.message : String(error),
            attributes: {
              details: error instanceof Error ? error.toString() : String(error)
            }
          }
        });
      }
    }
  );*/
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
  router.post(
    { path: '/api/integrations/wazuh/update-groups-agent-conf',
      validate: {
        body: schema.object({
          token: schema.string(),
          agentConfFileName: schema.string()
        })
      } },
    async (context, request, response) => {
      interface UploadAgentConfRequestBody {
        token: string;
        agentConfFileName: string;
      }
      const {token, agentConfFileName} = request.body as UploadAgentConfRequestBody;
      try {
        if (!token) {
          return response.badRequest({
            body: {
              message: 'Authentication token is required'
            }
          });
        }
        deps.logger.info('Uploading groupsagent conf to Wazuh Manager');
        await uploadGroupsAgentConfig(token, agentConfFileName);
        return response.ok({
          body: {
            message: 'Agent conf uploaded successfully',
            attributes: {
              fileName: agentConfFileName
            }
          }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        deps.logger.error(`Failed to upload agent conf: ${errorMessage}`, {error});
        return response.customError({
          statusCode: 500,
          body: {
            message: `Failed to upload agent conf: ${errorMessage}`,
            attributes: {
              success: false,
              details: error instanceof Error ? error.toString() : String(error)
            }
          }
        });
      }
    }
  )
  // === POST: Restart Wazuh Manager ===
  router.post(
    { path: '/api/integrations/wazuh/restart',
      validate: {
        body: schema.object({
          token: schema.string()
        })
      } },
    async (context, request, response) => {
      interface ManagerRestartRequestBody {
        token: string;
      }
      const {token} = request.body as ManagerRestartRequestBody;
      try {
        if (!token) {
          return response.badRequest({
            body: {
              message: 'Authentication token is required'
            }
          });
        }
        deps.logger.info('Restarting Wazuh Manager');
        await restartWazuhManager(token);

        return response.ok({
          body: {
            message: 'Wazuh Manager restarted successfully'
          }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        deps.logger.error(`Failed to restart Wazuh Manager: ${errorMessage}`, { error });

        return response.customError({
          statusCode: 500,
          body: {
            message: `Failed to restart Wazuh Manager: ${errorMessage}`,
            attributes: {
              success: false,
              details: error instanceof Error ? error.toString() : String(error)
            }
          }
        });
      }
    }
  );

}
