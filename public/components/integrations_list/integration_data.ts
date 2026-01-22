import {VIRUSTOTAL_DOC_URL} from "../../../common/constants";

export interface IntegrationItem {
  id: number;
  name: string;
  type: 'connected' | 'auto' | 'manual' | 'forward';
  button?: string;
  buttonClickHandler?: () => void;
  menuClickHandler?: () => void;
  forwardUrl?: string;
}
export const integrationsData: IntegrationItem[] = [
  { id: 1, name: 'scopd', type: 'auto', button: 'Connected' },
  { id: 2, name: 'kubernetes', type: 'manual', button: 'Configure' },
  { id: 3, name: 'virusTotal', type: 'forward', button: 'Configure', forwardUrl: VIRUSTOTAL_DOC_URL },
  { id: 4, name: 'aws', type: 'manual', button: 'Configure' },
  { id: 5, name: 'abuseIpdb', type: 'manual', button: 'Configure' },
  { id: 6, name: 'criminalIp', type: 'manual', button: 'Configure' },
  { id: 7, name: 'docker', type: 'manual', button: 'Configure' },
  { id: 8, name: 'googlecloud', type: 'manual', button: 'Configure' },
  { id: 9, name: 'jira', type: 'manual', button: 'Configure' },
  { id: 10, name: 'maltiverse', type: 'manual', button: 'Configure' },
  { id: 11, name: 'microsoftAzure', type: 'manual', button: 'Configure' },
  { id: 12, name: 'microsoftTeams', type: 'manual', button: 'Configure' },
  { id: 13, name: 'misp', type: 'manual', button: 'Configure' },
  { id: 14, name: 'pagerDuty', type: 'manual', button: 'Configure' },
  { id: 15, name: 'serviceNow', type: 'manual', button: 'Configure' },
  { id: 16, name: 'shuffle', type: 'manual', button: 'Configure' },
  { id: 17, name: 'slack', type: 'manual', button: 'Configure' },
  { id: 18, name: 'splunk', type: 'manual', button: 'Configure' },
  { id: 19, name: 'theHive', type: 'manual', button: 'Configure' },
  { id: 20, name: 'tines', type: 'manual', button: 'Configure' },
];
