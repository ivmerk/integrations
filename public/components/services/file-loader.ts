import CoreStart from "../../../../../src/core/public";
import {SCOPD_RULES_FILE_NAME} from "../../../common/constants";
export interface LoadConfigFile {
  fileContent: string;
}
export async function loadConfigFile(http:CoreStart['http'],fileName:string) {
  try {
    console.log('Try to load configuration file');
    const response = await http.post('/api/integrations/load-config-file', {
      body: JSON.stringify({
        configFileName: fileName
      })
    })
    if (response.fileContent) {
      console.log('Loaded configuration file:', response.fileContent);
      return  response.fileContent;
    }
  } catch (error){

  }
}
