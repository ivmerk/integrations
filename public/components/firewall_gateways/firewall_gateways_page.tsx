import React from 'react';
import { CoreStart } from '../../../../src/core/public';
import { DevicesGroupPage } from '../devices_group_page';

interface FirewallGatewaysPageProps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
}

const firewallGatewaysGroupsFilters = [
  {
    title: 'Cisco Firepower',
    icon: 'cisco',
    models: ['FPR1010 / 1010E / 1120 / 1140 / 1150 / 2110 / 2120 / 2130 / 2140'] ,
    value: 'cisco_ftd'
  },
  {
    title: 'Cisco ASA',
    icon: 'cisco',
    models: ['ASA 5500 Series', 'ASA 5505 / 5510 / 5506-X / 5508-X / 5512-X / 5515-X / 5516-X'],
    value: 'cisco_asa'
  },
  {
    title: 'Juniper Security Gateway',
    icon: 'juniperNetworks',
    models: ['SRX300 / SRX320 / SRX320-POE / SRX340 / SRX345 / SRX380 / SRX550'],
    value: 'junos'
  },
  {
    title: 'Palo Alto',
    icon: 'panoAltoNetworks',
    models: ['PA-200 / PA-505 / PA-510 / PA-520 / PA-540'],
    value: 'paloalto'
  },
  {
    title: 'FortiGate',
    icon: 'fortiNet',
    models: ['FortiGate 40F / 50G / 51G / 60F / 61F / 70F / 70G / 71F / 71G / 80F / 81F / 90G / 91G (and variants)'],
    value: 'fortigate'},
];
export const FirewallGatewaysPage = ({ basename, notifications, http }: FirewallGatewaysPageProps) => (
  <DevicesGroupPage
    basename={basename}
    pageTitle="Firewalls &amp; Gateways"
    filters={firewallGatewaysGroupsFilters}
    notifications={notifications}
    http={http}
  />
);
