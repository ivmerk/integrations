import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

export interface IntegrationsPluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IntegrationsPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
