import React from 'react';
import ReactDOM from 'react-dom';
import { AppMountParameters, CoreStart } from '../../../src/core/public';
import { AppPluginStartDependencies } from './types';

// Simple Dashboard component
const DashboardApp: React.FC<{
  basename: string;
  notifications: any;
  http: any;
  savedObjects: any;
  navigation: any;
}> = ({ basename, notifications, http, savedObjects, navigation }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Integrations Dashboard</h1>
      <p>This is the new dashboard application within the Integrations category.</p>
      <div style={{ marginTop: '20px' }}>
        <h3>Available Features:</h3>
        <ul>
          <li>Integration Status Overview</li>
          <li>System Health Monitoring</li>
          <li>Recent Activity Log</li>
          <li>Quick Actions Panel</li>
        </ul>
      </div>
    </div>
  );
};

export const renderApp = (
  { notifications, http, savedObjects }: CoreStart,
  { navigation }: AppPluginStartDependencies,
  { appBasePath, element }: AppMountParameters
) => {
  ReactDOM.render(
    <DashboardApp
      basename={appBasePath}
      notifications={notifications}
      http={http}
      savedObjects={savedObjects}
      navigation={navigation}
    />,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
