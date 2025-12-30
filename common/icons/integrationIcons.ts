import {AwsLogo, KubernetesLogo, ScopdLogo, AbuseIPDBLogo} from './logos';
import {VirusTotalLogo} from "./logos";

export const integrationIcons = {
  scopd: ScopdLogo,
  virusTotal: VirusTotalLogo,
  kubernetes: KubernetesLogo,
  aws: AwsLogo,
  abuseIpdb: AbuseIPDBLogo,
} as const;

export type IntegrationIconName = keyof typeof integrationIcons;
