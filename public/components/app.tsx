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
  output?: {
    statusCode?: number;
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

  const onObjectWriteButtonClickHandler = async () => {
    try {
      if (buttonText === 'disable') {
        setButtonText('enable');
      }
        const res = await fetch('/api/integrations/scopd/status');
        const data = await res.json();
        console.log('Scopd Integration enabled:', data);
      } catch (error: unknown) {
        const apiError = error as ApiError;
        if (
          apiError.output?.statusCode === 404
        )  {
          console.log('No saved object yet');
        } else {
          console.error('Error loading integration status:', error instanceof Error ? error.message : String(error));
        }
      }
  };
  const onObjectReadButtonClickHandler = async () => {
    try {
      const res = await fetch('/api/integrations/scopd/status');
      const data = await res.json();
      console.log('Scopd Integration enabled:', data);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (
        apiError.output?.statusCode === 404
      )  {
        console.log('No saved object yet');
      } else {
        console.error('Error loading integration status:', error instanceof Error ? error.message : String(error));
      }
    };
    try {
      const ruleRes = await fetch('/api/integrations/scopd/rule');
      const rule = await ruleRes.json();
      console.log("file", rule);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (
        apiError.output?.statusCode === 404
      )  {
        console.log('No saved object yet');
      } else {
        console.error('Error loading integration status:', error instanceof Error ? error.message : String(error));}
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
                    <EuiButton type="primary" size="s" onClick={onObjectWriteButtonClickHandler}>
                      <FormattedMessage id="integration.buttonText" defaultMessage="write object" />
                    </EuiButton>
                  </EuiText>
                  <EuiText>
                    <EuiHorizontalRule />
                    <p>
                      <FormattedMessage
                        id="integration.buttonText"
                        defaultMessage="Field text: {text}"
                        values={{ text: buttonText || 'Unknown' }}
                      />
                    </p>
                    <EuiButton type="primary" size="s" onClick={onObjectReadButtonClickHandler}>
                      <FormattedMessage id="integration.buttonText" defaultMessage="read object" />
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
