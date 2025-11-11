import CoreStart from "../../../../../src/core/public";

interface saveObject {
  savedObjects: CoreStart['savedObjects'];
  notifications: CoreStart['notifications'];
}
interface ApiError extends Error {
  res?: {
    status?: number;
    data?: {
      error?: {
        message: string;
      };
    };
  };
}

export async function saveObject({savedObjects, notifications}) {
  try {
    const savedObjectsClient = savedObjects.client;
    console.log('Attempting to save integration status...');
    const response = await savedObjectsClient.create(
      'integration-status',
      {
        integration: 'scopd',
        enabled: true
      },
      {
        id: 'scopd-status',
        overwrite: true
      }
    );
    console.log('Save successful:', response);
    notifications.toasts.addSuccess('Integration status updated successfully');
  } catch (error: unknown) {

    const apiError = error as ApiError;

    console.error('Error details:', {
      name: apiError?.name,
      message: apiError?.message,
      statusCode: apiError?.res?.status,
      error: apiError?.res?.data,
      stack: apiError?.stack
    });
    const errorMessage = apiError?.res?.data?.error?.message ||
      apiError?.message ||
      'Unknown error occurred';
    notifications.toasts.addDanger(
      `Failed to update integration status: ${errorMessage}`
    );
  }
}
