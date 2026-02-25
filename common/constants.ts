export const PLUGIN_ID = 'integrations';
export const PLUGIN_NAME = 'Settings';
export const CONFIGURATION_FILES_PATH = '/src/plugins/integrations/custom-configuration-files/';

export const SCOPD_RULES_FILE_NAME = 'scopd_rules.xml';
export const SCOPD_AGENT_CONF_FILE_NAME = 'agent.conf';
export const SCOPD_DECODERS_FILE_NAME = 'scopd_decoders.xml';
export const SCOPD_OSSEC_CONF_FILE_NAME = 'ossec.conf.xml';

export const GROUP_NAME = 'default';

export const DEVICES_INDEX = 'integrations-devices';

export const VIRUSTOTAL_DOC_URL = 'https://netanelpo.github.io/scopd-integrations-docs/integrations/virustotal/';

export const routingSwitchingDevicesGroupsFilters = [
  {
    title: 'Cisco Routers / Cisco Switches',
    models: ['Cisco 900 Series', 'ISR 1100 / 1900 / 2800 / 2900 / 3800 / 4000', 'Catalyst 9300 / 9200', 'Catalyst 3850 / 3750 / 3650 / 3560 / 2960 / 2950'] ,
    value: 'cisco_ios'
  },
  {
    title: 'Juniper Switches',
    models: ['EX2100 / EX3200 / EX4200 / EX4600'] ,
    value: null
},
  {
    title: 'Cisco Nexus',
    models: [],
    value: null
  }
];

export const firewallGatewaysGroupsFilters = [
  {
    title: 'Cisco Firepower',
    models: ['FPR1010 / 1010E / 1120 / 1140 / 1150 / 2110 / 2120 / 2130 / 2140'] ,
    value: 'cisco_ftd'
  },
  {
    title: 'Cisco ASA',
    models: ['ASA 5500 Series', 'ASA 5505 / 5510 / 5506-X / 5508-X / 5512-X / 5515-X / 5516-X'],
    value: 'cisco_asa'
  },
  {
    title: 'Juniper Security Gateway',
    models: ['SRX300 / SRX320 / SRX320-POE / SRX340 / SRX345 / SRX380 / SRX550'],
    value: 'junos'
  },
  {
    title: 'Palo Alto',
    models: ['PA-200 / PA-505 / PA-510 / PA-520 / PA-540'],
    value: 'paloalto'
  },
  {
    title: 'FortiGate',
    models: ['FortiGate 40F / 50G / 51G / 60F / 61F / 70F / 70G / 71F / 71G / 80F / 81F / 90G / 91G (and variants)'],
    value: 'fortigate'},
];
