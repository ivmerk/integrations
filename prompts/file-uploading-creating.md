Make change in POST '/api/integrations/device' to upload files to the server. 
Check have need login to Wazuh Manager. If need, add login to Wazuh Manager.
Firstly, simular with function uploadRulesFile in public/components/services/rules-file-uploader.ts
and uploadDecoderFile in public/components/services/decoder-file-uploader.ts.
Secondly, if "allowed_ips": is not empty, put it to tag <allowed-ips> in file ossec.conf.xml
and upload it to the server. if "allowed_ips": is empty, just file ossec.conf.xml upload it to the server like in get-scopd-integration.ts
const confFileContent = await getConfig({http});
fileContent = await loadConfigFile({http,fileName: SCOPD_OSSEC_CONF_FILE_NAME});
await updateAgentConfFile({http, confFileContent, fileContent});
Thirdly, restart Wazuh Manager.

