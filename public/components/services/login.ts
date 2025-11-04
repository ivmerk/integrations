import CoreStart from "../../../../../src/core/public";
interface login  {
  http:CoreStart['http'],
  notifications:CoreStart['notifications']
}
export async function login({http, notifications}:login ) {
  try {
    console.log('Try to login')
    const response = await http.post('/api/login', {
      body: JSON.stringify({
        idHost: 'default',
        force: true,

      }),
    });
    if (response.token) {
      console.log('Wazuh authentication successful:', response.token);
      notifications.toasts.addSuccess('Successfully authenticated with Wazuh');
      return response.token;
      // Handle the token (store it in state, context, or local storage)
    } else {
      console.error('Error request testing :', response.message);
    }
  } catch (error){
    console.error('Error request testing :', error);
  }
}
