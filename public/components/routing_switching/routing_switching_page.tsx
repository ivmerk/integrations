import React from 'react';
import { CoreStart } from '../../../../src/core/public';
import { DevicesGroupPage } from '../devices_group_page';
import { routingSwitchingDevicesGroupsFilters } from '../../../common/constants';

interface RoutingSwitchingPageProps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
}

export const RoutingSwitchingPage = ({ basename, notifications, http }: RoutingSwitchingPageProps) => (
  <DevicesGroupPage
    basename={basename}
    pageTitle="Routing &amp; Switching"
    filters={routingSwitchingDevicesGroupsFilters}
    notifications={notifications}
    http={http}
  />
);
