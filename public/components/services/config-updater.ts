import {GROUP_NAME} from "../../../common/constants";
import CoreStart from "../../../../../src/core/public";

export async function getConfig({http}) {
  try {
    const response = await http.post('/api/request', {
      body: JSON.stringify({
        body: {
          params: {
            raw: true,
          }
        },
        id: `${GROUP_NAME}`,
        method: 'GET',
        path: '/manager/configuration'
      }),
    });
    return response;
  } catch (error) {
    console.error('Error getting WazuhManager conf:', error);
  }
}

interface UpdateAgentConfFile {
  http: CoreStart['http'];
  confFileContent: string;
  fileContent: string;
}
export async function updateAgentConfFile({http, confFileContent, fileContent}:UpdateAgentConfFile) {
  if (confFileContent.replace(/\s/g, '').includes(fileContent.replace(/\s/g, ''))) {
    console.log('File had been updated to previous iteration')
    return;
  }
  const ossecConfigEndIndex = confFileContent.indexOf('>', confFileContent.indexOf('<ossec_config>')) + 1;
  if (ossecConfigEndIndex === 0) {
    throw new Error('Could not find <ossec_config> tag in the XML');
  }

  // Get the indentation of the line with <ossec_config>
  const lineStart = confFileContent.lastIndexOf('\n', ossecConfigEndIndex) + 1;
  const indent = confFileContent.substring(lineStart, confFileContent.indexOf('<', lineStart)).replace(/[^ \t]/g, '');
  const before = confFileContent.substring(0, ossecConfigEndIndex);
  const after = confFileContent.substring(ossecConfigEndIndex);

  // Add newline and proper indentation
 const updatedFileContent = `${before}\n${indent}${fileContent.trim().replace(/\n/g, `\n${indent}`)}${after}`;
  try {
    const response = await http.post('/api/request', {
      body: JSON.stringify({
        body: {
          body: updatedFileContent,
          origin: 'raw',
        },
        id: `${GROUP_NAME}`,
        method: 'PUT',
        path: '/manager/configuration'
      }),
    });
    console.log('Updating success:', response);
  }catch (error: unknown) {
    console.error('Error updating WazuhManager conf:', error);
  }
}
