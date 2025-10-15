import fetch from 'node-fetch';
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
    const WAZUH_API = 'https://localhost:55000';

    // Register server side APIs
    defineRoutes(router);

    // === GET: Check Scopd status ===
    router.get(
      { path: '/api/integrations/scopd/status', validate: false },
      async (context, request, response) => {
        const savedObjectsClient = context.core.savedObjects.client;
        try {
          const obj = await savedObjectsClient.get<IntegrationStatusAttributes>('integration-status', 'scopd-status');
          return response.ok({
            body: {
              integration: obj.attributes.integration,
              enabled: obj.attributes.enabled,
            },
          });
        } catch (error: unknown) {
          const e = error as { output?: { statusCode?: number }, message?: string };
          if (e.output?.statusCode === 404) {
            return response.ok({
              body: { integration: 'scopd', enabled: false },
            });
          }
          return response.customError({
            statusCode: 500,
            body: { message: e.message || 'An unknown error occurred' },
          });
        }
      }
    );

    router.post(
      { path: '/api/integrations/scopd/enable', validate: false },
      async (context, request, response) => {

        const savedObjectsClient = context.core.savedObjects.client;
        try {
          // 1. Check existing status
          let existing: IntegrationStatusAttributes | null;
          try {
            const obj = await savedObjectsClient.get<IntegrationStatusAttributes>('integration-status', 'scopd-status');
            existing = obj.attributes;
          } catch {
            existing = null;
          }
          if (existing?.enabled) {
            return response.ok({body: {message: 'Already enabled'}});
          }

          const ruleContent = `
<group name="scopd,">
  <rule id="100900" level="12">
    <description>SCOPD Integration rule</description>
  </rule>
</group>`.trim();

          // 4. Save new status
          await savedObjectsClient.create(
            'integration-status',
            { integration: 'scopd', enabled: true },
            { id: 'scopd-status', overwrite: true }
          );

          return response.ok({
            body: { message: 'Scopd integration enabled and manager reloaded' },
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          return response.customError({
            statusCode: 500,
            body: { message: errorMessage },
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
