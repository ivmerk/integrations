import './index.scss';

import { IntegrationsPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.
export function plugin() {
  return new IntegrationsPlugin();
}
export { IntegrationsPluginSetup, IntegrationsPluginStart } from './types';
