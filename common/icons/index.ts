import { ReactComponent as ScopdIcon } from './scopd.svg';
import { ReactComponent as KubernetesIcon } from './kubernetes.svg';
import { ReactComponent as VirusTotalIcon } from './virus_total.svg';

export const integrationIcons = {
  scopd: ScopdIcon,
  kubernetes: KubernetesIcon,
  virusTotal: VirusTotalIcon,
} as const;

export type IntegrationIconName = keyof typeof integrationIcons;
