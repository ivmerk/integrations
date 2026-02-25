import React from 'react';
import ReactDOM from 'react-dom';
import { AppMountParameters, CoreStart } from '../../../src/core/public';
import { AppPluginStartDependencies } from './types';
import { FirewallGatewaysPage } from './components/firewall_gateways/firewall_gateways_page';

export const renderApp = (
  { notifications, http }: CoreStart,
  { navigation }: AppPluginStartDependencies,
  { appBasePath, element }: AppMountParameters
) => {
  ReactDOM.render(
    <FirewallGatewaysPage
      basename={appBasePath}
      notifications={notifications}
      http={http}
    />,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
