import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';

import { IntegrationsPluginSetup, IntegrationsPluginStart } from './types';
import { defineRoutes } from './routes';

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

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('integrations: Started');
    return {};
  }

  public stop() {}
}
