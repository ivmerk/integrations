import {GROUP_NAME} from "../../../common/constants";

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
    console.log('Geting success:', response);
  } catch (error) {

    console.error('Error getting WazuhManager conf:', error);
  }
}
