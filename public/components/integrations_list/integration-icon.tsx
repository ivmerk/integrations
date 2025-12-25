import { integrationIcons, IntegrationIconName } from '../../common/icons';

type Props = {
  name: IntegrationIconName;
  size?: number;
};

export const IntegrationIcon = ({name, size = 28}: Props) => {
  const Icon = integrationIcons[name];

  return (
      <Icon
        width={size}
        height={size}
        aria-hidden
      />
  );
};
