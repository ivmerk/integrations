import CoreStart from "../../../../../src/core/public";
export async function restartManager(http:CoreStart['http']) {
  try {
    console.log('Restarting Wazuh Manager...')
    const response = await http.post('/api/request', {
      body: JSON.stringify({
        body:{

        },
      id:'default',
      method:'PUT',
      path:'/manager/restart'
    })
    })
    console.log('Restarting success:', response);
  }catch (error: unknown) {
    console.error('Error restarting WazuhManager:', error);
  }
}
