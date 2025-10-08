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

export class IntegrationsPlugin
  implements Plugin<IntegrationsPluginSetup, IntegrationsPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('integrations: Setup');
    const router = core.http.createRouter();

    // Register server side APIs
    defineRoutes(router);

    // Register saved object types
    core.savedObjects.registerType(integrationStatusSavedObject);

    return {
      getIntegrationStatusType: () => integrationStatusType
    };
  }

  public start(core: CoreStart) {
    this.logger.debug('integrations: Started');
    return {};
  }

  public stop() {}
}
