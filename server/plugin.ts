import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';

import { IntegrationsPluginSetup, IntegrationsPluginStart } from './types';
import { defineRoutes } from './routes';
import {
  integrationStatusSavedObject,
  integrationStatusType,
} from './saved_objects/integration_status';
import {authenticateWazuh} from "../common/fetch_wazuh_manager_sevice";

interface IntegrationStatusAttributes {
  integration: string;
  enabled: boolean;
  updated_at?: string;
}

export class IntegrationsPlugin
  implements Plugin<IntegrationsPluginSetup, IntegrationsPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('integrations: Setup');
    const router = core.http.createRouter();
    // 2. Push rule file to Wazuh Manager

    // Register server side APIs
    defineRoutes(router);

    // === GET: Check Scopd status ===
    router.get(
      { path: '/api/integrations/scopd/status', validate: false },
      async (context, request, response) => {
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
          this.logger.error('Error message', { error: errorMessage });
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
    );
    // Register saved object types
    core.savedObjects.registerType(integrationStatusSavedObject);

    return {
      getIntegrationStatusType: () => integrationStatusType,
    };
  }

  public start(core: CoreStart) {
    this.logger.debug('integrations: Started');
    return {};
  }

  public stop() {}
}
