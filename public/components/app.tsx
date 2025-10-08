import React, { useState } from 'react';
import { FormattedMessage, I18nProvider } from '@osd/i18n/react';
import { BrowserRouter as Router } from 'react-router-dom';

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

  const onButtonClickHandler = async () => {
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
          enabled: true,
        },
        {
          id: 'scopd-status',
          overwrite: true,
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
        stack: apiError?.stack,
      });
      const errorMessage =
        apiError?.res?.data?.error?.message || apiError?.message || 'Unknown error occurred';
      notifications.toasts.addDanger(`Failed to update integration status: ${errorMessage}`);
    }
  };
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
                        id="integration.buttonText"
                        defaultMessage="Field text: {text}"
                        values={{ text: buttonText || 'Unknown' }}
                      />
                    </p>
                    <EuiButton type="primary" size="s" onClick={onButtonClickHandler}>
                      <FormattedMessage id="integration.buttonText" defaultMessage="Button" />
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
