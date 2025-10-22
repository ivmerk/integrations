export const PLUGIN_ID = 'integrations';
export const PLUGIN_NAME = 'Scopd';
export const SCOPD_RULES_FILE_NAME = 'scopd_rules.xml';
export const SCOPD_RULES_CONTENT = `
<group name="phishing,local,">
    <rule id="100180" level="12">
        <decoded_as>json</decoded_as>
        <if_sid>86600</if_sid>
        <field name="event_type">^phishing_link_click$</field>
        <description>Phishing Simulation: User clicked on a phishing link. Email: $(user_email)</description>
        <options>no_full_log</options>
    </rule>
</group>
<group name="dlp,">
    <rule id="100190" level="0">
        <decoded_as>dlp-syslog</decoded_as>
        <description>Group Scopd DLP</description>
    </rule>
    <rule id="100191" level="12">
        <if_sid>100190</if_sid>
        <event_type>108</event_type>
        <description>DLP: Clipboard with image detected</description>
    </rule>
    <rule id="100192" level="12">
        <if_sid>100190</if_sid>
        <event_type>CLIPBOARD_IMAGE</event_type>
        <description>DLP: Clipboard with image detected</description>
    </rule>
</group> `;

export const SCOPD_AGENT_CONF_FILE_NAME = 'agent.conf';
export const SCOPD_AGENT_CONF_CONTENT = `
<ossec_config>
     <localfile>
        <log_format>syslog</log_format>
        <location>/var/log/syslog</location>
    </localfile>
</ossec_config>
`;

export const SCOPD_DECODER_FILE_NAME = 'scopd_decoder.xml';
export const SCOPD_DECODER_CONTENT = `
<decoder name="dlp-syslog">
    <type>syslog</type>
    <program_name>^(stsrv|scopd-dlp)$</program_name>
    <prematch>(stsrv|scopd-dlp)</prematch>
</decoder>
<decoder name="dlp-syslog">
  <parent>dlp-syslog</parent>
  <regex>event_type="([^"]+)"</regex>
  <order>event_type</order>
</decoder>
`;
