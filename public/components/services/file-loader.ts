import CoreStart from "../../../../../src/core/public";

interface LoadConfigFile {
  http: CoreStart['http'];
  fileName: string;
}
export async function loadConfigFile({http, fileName}:LoadConfigFile) {
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
