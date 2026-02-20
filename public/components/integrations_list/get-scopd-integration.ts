import { CoreStart } from "../../../../src/core/public";
import {saveObject} from "../services/object-saver";
import {login} from "../services/login";
import {loadConfigFile} from "../services/file-loader";
import {
  SCOPD_AGENT_CONF_FILE_NAME,
  SCOPD_DECODERS_FILE_NAME,
  SCOPD_OSSEC_CONF_FILE_NAME,
  SCOPD_RULES_FILE_NAME
} from "../../../common/constants";
import {uploadRulesFile} from "../services/rules-file-uploader";
import {uploadDecoderFile} from "../services/decoder-file-uploader";
import {uploadAgentConfFile} from "../services/agent-conf-file-uploader";
import {getConfig, updateAgentConfFile} from "../services/config-updater";
import {restartManager} from "../services/manager-restart";
interface GetScopedIntegrationParams {
  savedObjects: CoreStart['savedObjects'];
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
}

export  async function getScopedIntegration({savedObjects, notifications, http}: GetScopedIntegrationParams) {

  console.log('getScopedIntegration');
await saveObject({savedObjects, notifications});
await login({http, notifications});
let fileContent = await loadConfigFile({http,fileName: SCOPD_RULES_FILE_NAME});
await uploadRulesFile({http, fileContent});
fileContent = await loadConfigFile({http,fileName: SCOPD_DECODERS_FILE_NAME});
await uploadDecoderFile({http, fileContent} );
fileContent = await loadConfigFile({http,fileName: SCOPD_AGENT_CONF_FILE_NAME});
await uploadAgentConfFile({http, fileContent});
const confFileContent = await getConfig({http});
fileContent = await loadConfigFile({http,fileName: SCOPD_OSSEC_CONF_FILE_NAME});
await updateAgentConfFile({http, confFileContent, fileContent});
await restartManager({http});
}
