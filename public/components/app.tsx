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
import {SCOPD_DECODER_FILE_NAME, SCOPD_RULES_FILE_NAME, SCOPD_AGENT_CONF_FILE_NAME} from "../../common/constants";
import {loadConfigFile} from "./services/file-loader";
import {login} from "./services/login";
import {uploadRulesFile} from "./services/rules-file-uploader";
import {uploadDecoderFile} from "./services/decoder-file-uploader";
import {uploadAgentConfFile} from "./services/agent-conf-file-uploader";
import {restartManager} from "./services/manager-restart";
import {saveObject} from "./services/object-saver";


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
    let fileContent;
    if (buttonText === 'disable') {
      setButtonText('enable');
    }

    await saveObject({savedObjects, notifications});
    await login({http, notifications});
    fileContent = await loadConfigFile(http,SCOPD_RULES_FILE_NAME);
    await uploadRulesFile(http, fileContent);
    fileContent = await loadConfigFile(http,SCOPD_DECODER_FILE_NAME);
    await uploadDecoderFile(http, fileContent );
    fileContent = await loadConfigFile(http,SCOPD_AGENT_CONF_FILE_NAME);
    await uploadAgentConfFile(http, fileContent );
    await restartManager(http);
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
                      <FormattedMessage id="integration.buttonText" defaultMessage="Enable" />
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
