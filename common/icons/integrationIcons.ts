import {KubernetesLogo, ScopdLogo} from './logos';
import {VirusTotalLogo} from "./logos";

export const integrationIcons = {
  scopd: ScopdLogo,
  virusTotal: VirusTotalLogo,
  kubernetes: KubernetesLogo
} as const;

export type IntegrationIconName = keyof typeof integrationIcons;
