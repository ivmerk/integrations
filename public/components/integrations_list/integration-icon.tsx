import React from 'react';
import { integrationIcons, IntegrationIconName } from '../../../common/icons';


type Props = {
  name: IntegrationIconName;
  size?: number;
};

export const IntegrationIcon = ({name, size = 120}: Props) => {
  const Icon = integrationIcons[name];

  if (!Icon) {
    console.error('IntegrationIcon not found:', name, integrationIcons);
    return null;
  }

  return (
      <Icon
        width={size}
        height={size}
        aria-hidden
      />
  );
};
