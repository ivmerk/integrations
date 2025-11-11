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
export async function updateAgentConfFile({http, confFileContent, fileContent}) {
  if (confFileContent.includes(fileContent)) {
    console.log('File updated yet')
    return fileContent;
  }
  const ossecConfigEndIndex = confFileContent.indexOf('>', confFileContent.indexOf('<ossec_config>')) + 1;
  if (ossecConfigEndIndex === 0) {
    throw new Error('Could not find <ossec_config> tag in the XML');
  }

  // Get the indentation of the line with <ossec_config>
  const lineStart = confFileContent.lastIndexOf('\n', ossecConfigEndIndex) + 1;
  const indent = confFileContent.substring(lineStart, confFileContent.indexOf('<', lineStart));
console.log('lineStart', lineStart, indent);
  // Insert the remote config with proper indentation
  const before = confFileContent.substring(0, ossecConfigEndIndex);
  const after = confFileContent.substring(ossecConfigEndIndex);

  // Add newline and proper indentation
  console.log(`${before}\n${indent}${fileContent.trim().replace(/\n/g, `${indent}`)}${after}`);
  try {
    const response = await http.post('/api/request', {
      body: JSON.stringify({
        body: {
          body: fileContent,
          origin: 'xmleditor',
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
