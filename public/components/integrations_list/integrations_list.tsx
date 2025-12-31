import React from 'react';
import { EuiPanel, EuiButton, EuiHealth, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import './integrations.scss';
import { integrationIcons, IntegrationIconName } from '../../common/icons';
import {IntegrationIcon} from "./integration-icon";

interface IntegrationItem {
  id: number;
  name: string;
  logo: string;
  status: 'connected' | 'connect' | 'manual';
}

const integrationsData: IntegrationItem[] = [
  { id: 1, name: 'scopd', logo: 'scope', status: 'connected' },
  { id: 2, name: 'kubernetes', logo: 'scope',  status: 'connect' },
  { id: 3, name: 'virusTotal', logo: 'scope', status: 'manual'},
  { id: 4, name: 'aws', logo: 'scope', status: 'manual'},
  { id: 5, name: 'abuseIpdb', logo: 'scope', status: 'manual'},
  { id: 6, name: 'criminalIp', logo: 'scope', status: 'manual'},
  { id: 7, name: 'docker', logo: 'scope', status: 'manual'},
  { id: 8, name: 'googlecloud', logo: 'scope', status: 'manual'},
  { id: 9, name: 'jira', logo: 'scope', status: 'manual'},
  { id: 10, name: 'maltiverse', logo: 'scope', status: 'manual'},
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
            <IntegrationIcon name={integration.name}/>
              {renderCardAction(integration.status, integration.name)}
          </EuiFlexGroup>
        </EuiPanel>
        </EuiFlexItem>
      ))}
    </EuiFlexGroup>
  );
};

export default IntegrationsList;
