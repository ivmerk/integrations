import { IRouter } from '../../../../src/core/server';
import { schema } from '@osd/config-schema';
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

}
