import CoreStart from "../../../../../src/core/public";
export async function uploadAgentConfFile(http:CoreStart['http'], fileContent: string) {

  try {

    const response = await http.post('/api/request', {
      body: JSON.stringify({
        body: {
          body: fileContent,
          origin: 'xmleditor',
        },
        id: 'default',
        method: 'PUT',
        path: '/groups/default/configuration'
      }),
    });
    console.log('Updating success:', response);
  }catch (error: unknown) {
    console.error('Error updating WazuhManager conf:', error);
  }
}
