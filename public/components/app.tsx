import React, { useState } from 'react';
import { FormattedMessage, I18nProvider } from '@osd/i18n/react';
import { BrowserRouter as Router } from 'react-router-dom';
import  IntegrationsList  from './integrations_list/integrations_list';
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
import {
  SCOPD_DECODER_FILE_NAME,
  SCOPD_RULES_FILE_NAME,
  SCOPD_AGENT_CONF_FILE_NAME,
  SCOPD_OSSEC_CONF_FILE_NAME
} from "../../common/constants";
import {loadConfigFile} from "./services/file-loader";
import {login} from "./services/login";
import {uploadRulesFile} from "./services/rules-file-uploader";
import {uploadDecoderFile} from "./services/decoder-file-uploader";
import { uploadAgentConfFile} from "./services/agent-conf-file-uploader";
import {restartManager} from "./services/manager-restart";
import {saveObject} from "./services/object-saver";
import {updateAgentConfFile, getConfig} from "./services/config-updater";


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
  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  return (
    <Router basename={basename}>
      <I18nProvider>
        <div className="integrations-wrapper">
          <EuiPage restrictWidth="1000px">
            <EuiPageBody component="main">
              <EuiPageHeader>
                <EuiTitle size="l">
                  <h1>
                    <FormattedMessage
                      id="integration.helloWorldText"
                      defaultMessage="{name}"
                      values={{ name: "Available Integrations"}}
                    />
                  </h1>
                </EuiTitle>
              </EuiPageHeader>
              <EuiPageContent>
                <EuiPageContentBody grow={1}>
                  <IntegrationsList savedObjects={savedObjects} notifications={notifications} http={http} />
                </EuiPageContentBody>
              </EuiPageContent>
            </EuiPageBody>
          </EuiPage>
        </div>
      </I18nProvider>
    </Router>
  );
};
