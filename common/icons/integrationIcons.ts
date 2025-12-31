import {
  AwsLogo,
  KubernetesLogo,
  ScopdLogo,
  AbuseIPDBLogo,
  CriminalIPLogo,
  DockerLogo,
} from './logos';
import {VirusTotalLogo} from "./logos";

export const integrationIcons = {
  scopd: ScopdLogo,
  virusTotal: VirusTotalLogo,
  kubernetes: KubernetesLogo,
  aws: AwsLogo,
  abuseIpdb: AbuseIPDBLogo,
  criminalIp: CriminalIPLogo,
  docker: DockerLogo,
} as const;

export type IntegrationIconName = keyof typeof integrationIcons;
