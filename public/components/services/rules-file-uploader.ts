import CoreStart from "../../../../../src/core/public";
import {SCOPD_RULES_FILE_NAME} from "../../../common/constants";
export async function uploadRulesFile(http:CoreStart['http'], fileContent: string) {
  try {
    console.log('Uploading rules started...');
    const response = await http.post('/api/request', {
      body: JSON.stringify({
        body: {
          body: fileContent,
          origin: 'raw',
          params: {
            overwrite: true,
            relative_dirname: 'etc/rules',
          },
        },
        id: 'default',
        method: 'PUT',
        path: `/rules/files/${SCOPD_RULES_FILE_NAME}`
      }),
    })
    console.log('Uploading success:', response);
  }catch (error: unknown) {
    console.error('Error request testing :', error);
  }
}
