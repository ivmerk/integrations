import React from 'react';
import { CoreStart } from '../../../../src/core/public';
import { DevicesGroupPage } from '../devices_group_page';

interface RoutingSwitchingPageProps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
}

const routingSwitchingDevicesGroupsFilters = [
  {
    title: 'Cisco Routers / Cisco Switches',
    icon: 'cisco',
    models: ['Cisco 900 Series', 'ISR 1100 / 1900 / 2800 / 2900 / 3800 / 4000', 'Catalyst 9300 / 9200', 'Catalyst 3850 / 3750 / 3650 / 3560 / 2960 / 2950'] ,
    value: 'cisco_ios'
  },
  {
    title: 'Juniper Switches',
    icon: 'juniperNetworks',
    models: ['EX2100 / EX3200 / EX4200 / EX4600'] ,
    value: null
  },
  {
    title: 'Cisco Nexus',
    icon: 'cisco',
    models: [],
    value: null
  }
];

export const RoutingSwitchingPage = ({ basename, notifications, http }: RoutingSwitchingPageProps) => (
  <DevicesGroupPage
    basename={basename}
    pageTitle="Routing &amp; Switching"
    filters={routingSwitchingDevicesGroupsFilters}
    notifications={notifications}
    http={http}
  />
);
