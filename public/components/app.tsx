import React, { useState } from 'react';
import { FormattedMessage, I18nProvider } from '@osd/i18n/react';
import { BrowserRouter as Router } from 'react-router-dom';
import {
  EuiButton,
  EuiHorizontalRule,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageHeader,
  EuiTitle,
  EuiText,
} from '@elastic/eui';
import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';
import { PLUGIN_ID, PLUGIN_NAME } from '../../common';

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
interface IntegrationsAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  savedObjects: CoreStart['savedObjects'];
  navigation: NavigationPublicPluginStart;
}

export const IntegrationsApp = ({
  basename,
  notifications,
  http,
  savedObjects,
  navigation,
}: IntegrationsAppDeps) => {

  const [buttonText, setButtonText] = useState<string | undefined>('disable');

  console.log('buttonText: ', buttonText);
  const onButtonClickHandler = async () => {
    let token = 'YOUR_AUTH_TOKEN';
    try {
      if (buttonText === 'disable') {
        setButtonText('enable');
      }

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
    try {
      console.log('Initiating Wazuh authentication...');
      const response = await http.post('/api/integrations/wazuh/authenticate');

      if (response.success && response.token) {
        console.log('Wazuh authentication successful:', response.token);
        token = response.token;
        notifications.toasts.addSuccess('Successfully authenticated with Wazuh');
        // Handle the token (store it in state, context, or local storage)
      } else {
        throw new Error(response.message || 'Authentication failed');
      }
    } catch (error: unknown) {
      console.error('Authentication error:', error);
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      notifications.toasts.addDanger(`Authentication failed: ${errorMessage}`);
    }
    try {
      console.log('Uploading rules started...')
      const response = await http.post('/api/integrations/wazuh/upload-rule', {
        body: JSON.stringify({
          token,
          ruleFileName: 'scopd_rules.xml'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Upload success:', response);
    } catch (error: unknown) {
      console.error('Error uploading rules:', error);
    }
try {
  console.log('Uploading decoder started...')
  const response = await http.post('/api/inegrations/wazuh/upload-decoder', {
    body: JSON.stringify({
      token,
      decoderFileName: 'scopd_decoders.xml'
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  console.log('Upload success:', response);
} catch (error: unknown) {
  console.error('Error uploading decoders:', error);
}
try {

      const response = await http.post('/api/integrations/wazuh/update-agent-conf', {
        body: JSON.stringify({
          token,
          agentConfFileName: 'agent_custom_tag.conf'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Updating success:', response);
}catch (error: unknown) {
      console.error('Error updating WazuhManager conf:', error);
}
try {
  console.log('Restarting Wazuh Manager...')
  const response = await http.post('/api/integrations/wazuh/restart', {
    body: JSON.stringify({
      token
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  console.log('Restart success:', response);
} catch (error: unknown) {
  console.error('Error restarting Wazuh Manager:', error);
}
}


  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  return (
    <Router basename={basename}>
      <I18nProvider>
        <>
          <navigation.ui.TopNavMenu
            appName={PLUGIN_ID}
            showSearchBar={true}
            useDefaultBehaviors={true}
          />
          <EuiPage restrictWidth="1000px">
            <EuiPageBody component="main">
              <EuiPageHeader>
                <EuiTitle size="l">
                  <h1>
                    <FormattedMessage
                      id="integration.helloWorldText"
                      defaultMessage="{name}"
                      values={{ name: PLUGIN_NAME }}
                    />
                  </h1>
                </EuiTitle>
              </EuiPageHeader>
              <EuiPageContent>
                <EuiPageContentHeader>
                  <EuiTitle>
                    <h2>
                      <FormattedMessage
                        id="integration.congratulationsTitle"
                        defaultMessage="Scopd Integration"
                      />
                    </h2>
                  </EuiTitle>
                </EuiPageContentHeader>
                <EuiPageContentBody>
                  <EuiText>
                    <EuiHorizontalRule />
                    <p>
                      <FormattedMessage
                        id="integration.buttonTextLabel"
                        defaultMessage="Field text: {text}"
                        values={{ text: buttonText || 'Unknown' }}
                      />
                    </p>
                    <EuiButton type="primary" size="s" onClick={onButtonClickHandler} isDisabled={buttonText === 'enable'}>
                      <FormattedMessage id="integration.buttonText" defaultMessage="asdfas" />
                    </EuiButton>
                  </EuiText>
                </EuiPageContentBody>
              </EuiPageContent>
            </EuiPageBody>
          </EuiPage>
        </>

      </I18nProvider>
    </Router>
  );
};
