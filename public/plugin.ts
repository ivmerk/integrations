import { i18n } from '@osd/i18n';
import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import {
  IntegrationsPluginSetup,
  IntegrationsPluginStart,
  AppPluginStartDependencies,
} from './types';
import { PLUGIN_NAME, PLUGIN_ID } from '../common';

export class IntegrationsPlugin implements Plugin<IntegrationsPluginSetup, IntegrationsPluginStart> {
  public setup(core: CoreSetup): IntegrationsPluginSetup {
    // Register an application into the side navigation menu
    core.application.register({
      id: PLUGIN_ID,
      get title() {
        return i18n.translate('core.ui.integrationsNavListSettingsPlugin.label', {
          defaultMessage: PLUGIN_NAME,
        });
      },
      category: {
        id: 'integrations',
        order: 50,
        get label() {
          return i18n.translate('core.ui.integrationsNavList.label', {
            defaultMessage: 'Integrations',
          });
        },
        euiIconType: 'visLine',
      },
      order: -1000,
      async mount(params: AppMountParameters) {
        // Get start services as specified in opensearch_dashboards.json
        const [coreStart, depsStart] = await core.getStartServices();

        // Set custom breadcrumbs
        coreStart.chrome.setBreadcrumbs([
          {
            text: PLUGIN_NAME,
          },
        ]);
        // Load application bundle
        const { renderApp } = await import('./application');
        // Render the application
        return renderApp(coreStart, depsStart as AppPluginStartDependencies, params);
      },
    });

    // Return methods that should be available to other plugins
    return {
      getGresting() {
        return i18n.translate('integrations.greetingText', {
          defaultMessage: 'Hello from {name}!',
          values: {
            name: PLUGIN_NAME,
          },
        });
      },
    };
  }

  public start(core: CoreStart): IntegrationsPluginStart {
    return {};
  }

  public stop() {}
}
