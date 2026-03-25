import React from 'react';
import { CoreStart } from '../../../../src/core/public';
import { DevicesGroupPage } from '../devices_group_page';

interface ApplicationsServicesPageProps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
}

const applicationsServicesFilters = [
  {
    title: 'Nginx',
    icon: 'nginx',
    models: [],
    value: null,
  },
  {
    title: 'Apache',
    icon: 'apache',
    models: [],
    value: null,
  },
  {
    title: 'Zabbix',
    icon: 'zabbix',
    models: [],
    value: null,
  },
  {
    title: 'Safetica DLP',
    icon: 'safeticaDlp',
    models: [],
    value: null,
  },
  {
    title: 'Scopd DLP',
    icon: 'scopdDlp',
    models: [],
    value: null,
  },
  {
    title: 'Bitrix24',
    icon: 'bitrix24',
    models: [],
    value: null,
  },
  {
    title: '1C Platform',
    icon: 'oneCPlatform',
    models: [],
    value: null,
  },
];

export const ApplicationsServicesPage = ({ basename, notifications, http }: ApplicationsServicesPageProps) => (
  <DevicesGroupPage
    basename={basename}
    pageTitle="Applications &amp; Services"
    pageId="applications-services"
    filters={applicationsServicesFilters}
    notifications={notifications}
    http={http}
  />
);
