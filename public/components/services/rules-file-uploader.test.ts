import { uploadRulesFile } from './rules-file-uploader';
import {GROUP_NAME, SCOPD_RULES_FILE_NAME} from '../../../common/constants';

// Mock CoreStart interface
const mockHttp = {
  post: jest.fn(),
};

const mockCoreStart = {
  http: mockHttp,
} as any;

describe('uploadRulesFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully upload rules file', async () => {
    const fileContent = 'sample rules content';
    const mockResponse = { success: true };
    mockHttp.post.mockResolvedValue(mockResponse);

    const consoleSpy = jest.spyOn(console, 'log');

    await uploadRulesFile(mockCoreStart.http, fileContent);

    expect(mockHttp.post).toHaveBeenCalledWith('/api/request', {
      body: JSON.stringify({
        body: {
          body: fileContent,
          origin: 'raw',
          params: {
            overwrite: true,
            relative_dirname: 'etc/rules',
          },
        },
        id: `${GROUP_NAME}`,
        method: 'PUT',
        path: `/rules/files/${SCOPD_RULES_FILE_NAME}`
      }),
    });

    expect(consoleSpy).toHaveBeenCalledWith('Uploading rules started...');
    expect(consoleSpy).toHaveBeenCalledWith('Uploading success:', mockResponse);
  });

  it('should handle upload errors gracefully', async () => {
    const fileContent = 'sample rules content';
    const error = new Error('Network error');
    mockHttp.post.mockRejectedValue(error);

    const consoleErrorSpy = jest.spyOn(console, 'error');

    await uploadRulesFile(mockCoreStart.http, fileContent);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error request testing :', error);
  });

  it('should handle empty file content', async () => {
    const fileContent = '';
    mockHttp.post.mockResolvedValue({ success: true });

    const consoleSpy = jest.spyOn(console, 'log');

    await uploadRulesFile(mockCoreStart.http, fileContent);

    expect(mockHttp.post).toHaveBeenCalledWith('/api/request', {
      body: JSON.stringify({
        body: {
          body: '',
          origin: 'raw',
          params: {
            overwrite: true,
            relative_dirname: 'etc/rules',
          },
        },
        id: `${GROUP_NAME}`,
        method: 'PUT',
        path: `/rules/files/${SCOPD_RULES_FILE_NAME}`
      }),
    });
  });
});
