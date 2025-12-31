import {
  AwsLogo,
  KubernetesLogo,
  ScopdLogo,
  AbuseIPDBLogo,
  CriminalIPLogo,
  DockerLogo,
  GoogleCloudLogo,
  JiraLogo, MaltiverseLogo,
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
  googlecloud: GoogleCloudLogo,
  jira: JiraLogo,
  maltiverse: MaltiverseLogo,
} as const;

export type IntegrationIconName = keyof typeof integrationIcons;
