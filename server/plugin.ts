import { integrationStatusSavedObject } from './saved_objects/integration_status';
import type {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';
import { IntegrationsPluginSetup, IntegrationsPluginStart } from './types';
import { defineRoutes } from './routes';
import {
  integrationStatusType,
} from './saved_objects/integration_status';

export class IntegrationsPlugin
  implements Plugin<IntegrationsPluginSetup, IntegrationsPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    const router = core.http.createRouter();

    // Register routes with logger
    defineRoutes(router, {
      logger: this.logger
    });

    this.logger.debug('integrations: Setup');

    // Register saved object types
    core.savedObjects.registerType(integrationStatusSavedObject);
    // === POST: Upload agent conf to Wazuh Manager ===

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
