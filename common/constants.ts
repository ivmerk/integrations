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

export const routingSwitchingDevicesGroupFilters = [
  {title: 'Cisco Routers / Cisco Switches', value: 'cisco_ios'},
  {title: 'Juniper Switches', value: null},
  {title: 'Cisco Nexus', value: null}
];

export const firewallGatewaysGroupFilters = [
  {title: 'Cisco Firepower', value: 'cisco_ftd'},
  {title: 'Cisco ASA', value: 'cisco_asa'},
  {title: 'Juniper Security Gateway', value: 'junos'},
  {title: 'Palo Alto', value: 'paloalto'},
  {title: 'FortiGate', value: 'fortigate'},
];
