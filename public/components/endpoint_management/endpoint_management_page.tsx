import React from 'react';
import { CoreStart } from '../../../../src/core/public';
import { DevicesGroupPage } from '../devices_group_page';

interface EndpointManagementPageProps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
}

const endpointManagementFilters = [
  {
    title: 'ESET',
    icon: 'eset',
    models: [],
    value: null,
  },
  {
    title: 'Dr.Web',
    icon: 'drWeb',
    models: [],
    value: null,
  },
  {
    title: 'HPE iLO',
    icon: 'hpeIlo',
    models: [],
    value: null,
  },
  {
    title: 'Dell iDRAC',
    icon: 'dellIdrac',
    models: [],
    value: null,
  },
];

export const EndpointManagementPage = ({ basename, notifications, http }: EndpointManagementPageProps) => (
  <DevicesGroupPage
    basename={basename}
    pageTitle="Endpoint &amp; Management Tools"
    pageId="endpoint-management"
    filters={endpointManagementFilters}
    notifications={notifications}
    http={http}
  />
);
