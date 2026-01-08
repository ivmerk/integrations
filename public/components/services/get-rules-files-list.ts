import CoreStart from "../../../../../src/core/public";
import {GROUP_NAME} from "../../../common/constants";

interface RulesFile {
  filename: string;
  // Add other properties if they exist in the response
}

export async function getRulesFilesList({http}: {http: CoreStart['http']}): Promise<RulesFile[]> {
  try {
    console.log('getRulesList');
    const response = await http.post('/api/request', {
      body: JSON.stringify({
        body: {},
        id: `${GROUP_NAME}`,
        method: 'GET',
        path: '/rules/files'
      })
    });
    return response?.data?.affected_items || [];
  } catch (error) {
    console.error('Error getting rules list:', error);
    return [];
  }
}
