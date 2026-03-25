import React from 'react';
import { CoreStart } from '../../../../src/core/public';
import { DevicesGroupPage } from '../devices_group_page';

interface DatabasesPageProps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
}

const databasesFilters = [
  {
    title: 'Microsoft SQL Server',
    icon: 'microsoftSqlServer',
    models: [],
    value: null,
  },
  {
    title: 'PostgreSQL',
    icon: 'postgresql',
    models: [],
    value: null,
  },
  {
    title: 'Oracle',
    icon: 'oracle',
    models: [],
    value: null,
  },
  {
    title: 'MySQL',
    icon: 'mysql',
    models: [],
    value: null,
  },
];

export const DatabasesPage = ({ basename, notifications, http }: DatabasesPageProps) => (
  <DevicesGroupPage
    basename={basename}
    pageTitle="Databases"
    pageId="databases"
    filters={databasesFilters}
    notifications={notifications}
    http={http}
  />
);
