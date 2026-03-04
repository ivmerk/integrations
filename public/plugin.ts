import { i18n } from '@osd/i18n';
import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../core/public';
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
        id: PLUGIN_ID,
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
            text: PLUGIN_ID.charAt(0).toUpperCase() + PLUGIN_ID.slice(1),
          },
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

    // Register a second application - Dashboard
    core.application.register({
      id: 'network-infrastructure-settings',
      get title() {
        return i18n.translate('core.ui.integrationsNavListNetworkInfrastructureSettings.label', {
          defaultMessage: 'Routing & Switching',
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
      order: -999, // Higher order than Settings (-1000)
      async mount(params: AppMountParameters) {
        // Get start services as specified in opensearch_dashboards.json
        const [coreStart, depsStart] = await core.getStartServices();

        // Set custom breadcrumbs
        coreStart.chrome.setBreadcrumbs([
          {
            text: 'Integrations',
          },
          {
            text: 'Routing & Switching',
          },
        ]);
        // Load dashboard application bundle
        const { renderApp } = await import('./routing_switching_application');
        // Render the dashboard application
        return renderApp(coreStart, depsStart as AppPluginStartDependencies, params);
      },
    });

    // Register firewall & gateways application
    core.application.register({
      id: 'network-security-settings',
      get title() {
        return i18n.translate('core.ui.integrationsNavListNetworkSecuritySettings.label', {
          defaultMessage: 'Firewalls & Gateways',
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
      order: -998,
      async mount(params: AppMountParameters) {
        const [coreStart, depsStart] = await core.getStartServices();

        coreStart.chrome.setBreadcrumbs([
          { text: 'Integrations' },
          { text: 'Firewalls & Gateways' },
        ]);

        const { renderApp } = await import('./firewall_gateways_application');
        return renderApp(coreStart, depsStart as AppPluginStartDependencies, params);
      },
    });

    // Return methods that should be available to other plugins
    return {
      getGreeting() {
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
