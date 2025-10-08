import { PluginInitializerContext } from '../../../src/core/server';
import { IntegrationsPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new IntegrationsPlugin(initializerContext);
}

export { IntegrationsPluginSetup, IntegrationsPluginStart } from './types';
