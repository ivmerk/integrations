import React from 'react';
import { CoreStart } from '../../../../src/core/public';
import { DevicesGroupPage } from '../devices_group_page';
import { firewallGatewaysGroupsFilters } from '../../../common/constants';

interface FirewallGatewaysPageProps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
}

export const FirewallGatewaysPage = ({ basename, notifications, http }: FirewallGatewaysPageProps) => (
  <DevicesGroupPage
    basename={basename}
    pageTitle="Firewalls &amp; Gateways"
    filters={firewallGatewaysGroupsFilters}
    notifications={notifications}
    http={http}
  />
);
