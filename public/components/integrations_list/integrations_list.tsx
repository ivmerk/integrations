import React from 'react';
import { EuiPanel, EuiButton, EuiHealth, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import './integrations.scss';
import {IntegrationIcon} from "./integration_icon";

interface IntegrationItem {
  id: number;
  name: string;
  logo: string;
  status: 'connected' | 'connect' | 'manual';
  button?: string;
}

const integrationsData: IntegrationItem[] = [
  { id: 1, name: 'scopd', logo: 'scope', status: 'connected', button: 'Connected' },
  { id: 2, name: 'kubernetes', logo: 'scope', status: 'manual', button: 'Configure' },
  { id: 3, name: 'virusTotal', logo: 'scope', status: 'manual', button: 'Configure' },
  { id: 4, name: 'aws', logo: 'scope', status: 'manual', button: 'Configure' },
  { id: 5, name: 'abuseIpdb', logo: 'scope', status: 'manual', button: 'Configure' },
  { id: 6, name: 'criminalIp', logo: 'scope', status: 'manual', button: 'Configure' },
  { id: 7, name: 'docker', logo: 'scope', status: 'manual', button: 'Configure' },
  { id: 8, name: 'googlecloud', logo: 'scope', status: 'manual', button: 'Configure' },
  { id: 9, name: 'jira', logo: 'scope', status: 'manual', button: 'Configure' },
  { id: 10, name: 'maltiverse', logo: 'scope', status: 'manual', button: 'Configure' },
  { id: 11, name: 'microsoftAzure', logo: 'scope', status: 'manual', button: 'Configure' },
  { id: 12, name: 'microsoftTeams', logo: 'scope', status: 'manual', button: 'Configure' },
  { id: 13, name: 'misp', logo: 'scope', status: 'manual', button: 'Configure' },
  { id: 14, name: 'pagerDuty', logo: 'scope', status: 'manual', button: 'Configure' },
  { id: 15, name: 'serviceNow', logo: 'scope', status: 'manual', button: 'Configure' },
  { id: 16, name: 'shuffle', logo: 'scope', status: 'manual', button: 'Configure' },
  { id: 17, name: 'slack', logo: 'scope', status: 'manual', button: 'Configure' },
  { id: 18, name: 'splunk', logo: 'scope', status: 'manual', button: 'Configure' },
  { id: 19, name: 'theHive', logo: 'scope', status: 'manual', button: 'Configure' },
  { id: 20, name: 'tines', logo: 'scope', status: 'manual', button: 'Configure' },
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
      className="integrations-grid"
      gutterSize="m"
    >
      {integrationsData.map((integration) => (
        <EuiFlexItem
          className="integration-item"
          key={integration.id}
          grow={true}
        >
        <EuiPanel
          key={integration.id}
          className="integration-card"
          hasBorder
          paddingSize="m"
        >
          <EuiFlexGroup
            className="integration-content"
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
