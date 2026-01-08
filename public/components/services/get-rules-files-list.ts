import CoreStart from "../../../../../src/core/public";
import {GROUP_NAME} from "../../../common/constants";

export async function getRulesFilesList({http}: {http: CoreStart['http']}) {
  try {
    console.log('getRulesList');
    const response = await http.post('/api/request', {
      body: JSON.stringify({
        body:{},
        id: `${GROUP_NAME}`,
        method:'GET',
        path:'/rules/files'
        })
    });
    console.log(response.data.affected_items);
      return response.data.affected_items;
  } catch (error) {
    console.error('Error getting rules list:', error);
  }
}
