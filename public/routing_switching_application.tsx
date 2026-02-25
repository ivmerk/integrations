import React from 'react';
import ReactDOM from 'react-dom';
import { AppMountParameters, CoreStart } from '../../../src/core/public';
import { AppPluginStartDependencies } from './types';
import { RoutingSwitchingPage } from './components/routing_switching/routing_switching_page';

export const renderApp = (
  { notifications, http }: CoreStart,
  { navigation }: AppPluginStartDependencies,
  { appBasePath, element }: AppMountParameters
) => {
  ReactDOM.render(
    <RoutingSwitchingPage
      basename={appBasePath}
      notifications={notifications}
      http={http}
    />,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
