import CoreStart from "../../../../../src/core/public";
import {SCOPD_DECODER_FILE_NAME} from "../../../common/constants";
export async function uploadDecoderFile(http:CoreStart['http'], fileContent: string) {

  try {
    console.log('Uploading decoder started...')
    const response = await http.post('/api/request', {
      body: JSON.stringify({
        body: {
          body: fileContent,
          origin: 'raw',
          params: {
            overwrite: true,
            relative_dirname: 'etc/decoders',
          },
        },
        id: 'default',
        method: 'PUT',
        path: `/decoders/files/${SCOPD_DECODER_FILE_NAME}`
      }),
    });
    console.log('Upload success:', response);
  } catch (error: unknown) {
    console.error('Error uploading decoders:', error);
  }
}
