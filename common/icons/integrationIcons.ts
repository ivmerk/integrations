import {
  AwsLogo,
  KubernetesLogo,
  ScopdLogo,
  AbuseIPDBLogo,
  CriminalIPLogo,
  DockerLogo,
  GoogleCloudLogo,
  JiraLogo,
  MaltiverseLogo,
  MicrosoftAzureLogo,
  MicrosoftTeamsLogo,
  VirusTotalLogo,
  MISPLogo,
  PagerDutyLogo,
  ServiceNowLogo,
} from './logos';

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
  microsoftAzure: MicrosoftAzureLogo,
  microsoftTeams: MicrosoftTeamsLogo,
  misp: MISPLogo,
  pagerDuty: PagerDutyLogo,
  serviceNow: ServiceNowLogo,
} as const;

export type IntegrationIconName = keyof typeof integrationIcons;
