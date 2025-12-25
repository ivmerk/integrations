import React from 'react';
import { EuiFlexItem, EuiPanel, EuiButton, EuiHealth, EuiFlexGroup } from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import './integrations.scss';
import { integrationIcons, IntegrationIconName } from '../../common/icons';

interface IntegrationItem {
  id: number;
  name: string;
  logo: string;
  status: 'connected' | 'connect' | 'manual';
}

const integrationsData: IntegrationItem[] = [
  { id: 1, name: 'Scopd', logo: 'scope', status: 'connected' },
  { id: 2, name: 'Google Cloud', logo: 'scope',  status: 'connect' },
  { id: 3, name: 'Microsoft Azure', logo: 'scope', status: 'manual'},
];

const IntegrationsList: React.FC = () => {
  const renderCardAction = (status: IntegrationItem['status'], name: string) => {
    switch (status) {
      case 'connected':
        return (
          <div className="card-status">
            <EuiHealth color="success">
              <FormattedMessage id="integrations.status.connected" defaultMessage="Connected" />
            </EuiHealth>
          </div>
        );
      case 'connect':
        return (
          <EuiButton
            size="s"
            fill={false}
            className="connect-btn"
            onClick={() => console.log(`Connect to ${name} clicked`)}
            aria-label={`Connect to ${name}`}
          >
            <FormattedMessage id="integrations.actions.connect" defaultMessage="Connect" />
          </EuiButton>
        );
      case 'manual':
        return (
          <EuiButton
            size="s"
            className="manual-btn"
            onClick={() => console.log(`Configure ${name} manually clicked`)}
            aria-label={`Configure ${name} manually`}
          >
            <FormattedMessage id="integrations.actions.manual" defaultMessage="Configure manually" />
          </EuiButton>
        );
      default:
        return null;
    }
  };

  return (
    <EuiFlexGroup
      wrap
      className="integrations-grid"
      direction="row"
      alignItems="stretch"
      gutterSize="m"
    >
      {integrationsData.map((integration) => (
        <EuiFlexItem
          key={integration.id}
          grow={1}
          style={{ minwidth: 260 }}
        >
        <EuiPanel
          key={integration.id}
          className="integration-card"
          hasBorder
          paddingSize="m"
        >
          <EuiFlexGroup className="integration-content"
          wrap
          direction="column"
          alignItems="center"
          >
            <div
              className="integration-logo"
            >
            </div>
            <div className="integration-name">{integration.name}</div>
              {renderCardAction(integration.status, integration.name)}
          </EuiFlexGroup>
        </EuiPanel>
        </EuiFlexItem>
      ))}
    </EuiFlexGroup>
  );
};

export default IntegrationsList;
