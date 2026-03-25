import React from 'react';
import { CoreStart } from '../../../../src/core/public';
import { DevicesGroupPage } from '../devices_group_page';

interface ServersCoreInfrastructurePageProps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
}

const serversCoreInfrastructureFilters = [
  {
    title: 'Windows Server',
    icon: 'windowsServer',
    models: [],
    value: null,
  },
  {
    title: 'Microsoft Active Directory',
    icon: 'microsoftActiveDirectory',
    models: [],
    value: null,
  },
  {
    title: 'Linux',
    icon: 'linux',
    models: [],
    value: null,
  },
];

export const ServersCoreInfrastructurePage = ({ basename, notifications, http }: ServersCoreInfrastructurePageProps) => (
  <DevicesGroupPage
    basename={basename}
    pageTitle="Servers &amp; Core Infrastructure"
    pageId="servers-core-infrastructure"
    filters={serversCoreInfrastructureFilters}
    notifications={notifications}
    http={http}
  />
);
