import React from 'react';
import ReactDOM from 'react-dom';
import { AppMountParameters, CoreStart } from '../../../src/core/public';
import { AppPluginStartDependencies } from './types';
import { EndpointManagementPage } from './components/endpoint_management/endpoint_management_page';

export const renderApp = (
  { notifications, http }: CoreStart,
  { navigation }: AppPluginStartDependencies,
  { appBasePath, element }: AppMountParameters
) => {
  ReactDOM.render(
    <EndpointManagementPage
      basename={appBasePath}
      notifications={notifications}
      http={http}
    />,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
