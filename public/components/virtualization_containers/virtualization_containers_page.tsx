import React from 'react';
import { CoreStart } from '../../../../src/core/public';
import { DevicesGroupPage } from '../devices_group_page';

interface VirtualizationContainersPageProps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
}

const virtualizationContainersFilters = [
  {
    title: 'VMware ESXi',
    icon: 'vmwareEsxi',
    models: [],
    value: null,
  },
  {
    title: 'VMware vCenter',
    icon: 'vmwareVcenter',
    models: [],
    value: null,
  },
  {
    title: 'Microsoft Hyper-V',
    icon: 'microsoftHyperV',
    models: [],
    value: null,
  },
  {
    title: 'Proxmox',
    icon: 'proxmox',
    models: [],
    value: null,
  },
  {
    title: 'Docker',
    icon: 'docker',
    models: [],
    value: null,
  },
];

export const VirtualizationContainersPage = ({ basename, notifications, http }: VirtualizationContainersPageProps) => (
  <DevicesGroupPage
    basename={basename}
    pageTitle="Virtualization &amp; Containers"
    pageId="virtualization-containers"
    filters={virtualizationContainersFilters}
    notifications={notifications}
    http={http}
  />
);
