import CoreStart from "../../../../../src/core/public";
import {GROUP_NAME} from "../../../common/constants";
export async function restartManager({http}:CoreStart['http']) {
  try {
    console.log('Restarting Wazuh Manager...')
    const response = await http.post('/api/request', {
      body: JSON.stringify({
        body:{

        },
      id: `${GROUP_NAME}`,
      method:'PUT',
      path:'/manager/restart'
    })
    })
    console.log('Restarting success:', response);
  }catch (error: unknown) {
    console.error('Error restarting WazuhManager:', error);
  }
}
