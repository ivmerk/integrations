import CoreStart from "../../../../../src/core/public";
import {GROUP_NAME} from "../../../common/constants";
interface UploadAgentConfFile {
  http: CoreStart['http'];
  fileContent: string;
}
export async function uploadAgentConfFile({http, fileContent}:UploadAgentConfFile) {

  try {

    const response = await http.post('/api/request', {
      body: JSON.stringify({
        body: {
          body: fileContent,
          origin: 'xmleditor',
        },
        id: `${GROUP_NAME}`,
        method: 'PUT',
        path: '/groups/default/configuration'
      }),
    });
    console.log('Updating success:', response);
  }catch (error: unknown) {
    console.error('Error updating WazuhManager conf:', error);
  }
}
