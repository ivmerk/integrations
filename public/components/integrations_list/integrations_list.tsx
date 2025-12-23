import React from 'react';
import {
  EuiPanel,
  EuiTitle,
  EuiButton,
  EuiSpacer,
  EuiHealth
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import './integrations.scss';

interface IntegrationItem {
  id: number;
  name: string;
  status: 'connected' | 'connect' | 'manual';
  color: string;
}

interface LogoPlaceholderProps {
  name: string;
  color: string;
}

const LogoPlaceholder: React.FC<LogoPlaceholderProps> = ({ name, color }) => (
  <div className="logo-placeholder" style={{ color }}>
    <span className="logo-icon" aria-hidden="true">❖</span>
    <span className="logo-text">{name}</span>
  </div>
);

const integrationsData: IntegrationItem[] = [
  { id: 1, name: 'AWS', status: 'connected', color: '#FF9900' },
  { id: 2, name: 'Google Cloud', status: 'connect', color: '#4285F4' },
  { id: 3, name: 'Microsoft Azure', status: 'manual', color: '#0089D6' },
  { id: 4, name: 'Slack', status: 'connect', color: '#4A154B' },
  { id: 5, name: 'Microsoft Teams', status: 'connected', color: '#6264A7' },
  { id: 6, name: 'PagerDuty', status: 'connect', color: '#005E1F' },
  { id: 7, name: 'Splunk', status: 'connected', color: '#000000' },
  { id: 8, name: 'TheHive', status: 'connect', color: '#FFD900' },
  { id: 9, name: 'Tines', status: 'connected', color: '#111111' },
  { id: 10, name: 'AbuseIPDB', status: 'manual', color: '#D93F3C' },
  { id: 11, name: 'Criminal IP', status: 'connected', color: '#0C2D6B' },
  { id: 12, name: 'MISP', status: 'manual', color: '#2B2B2B' },
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

  if (!integrationsData?.length) {
    return (
      <div className="integrations-wrapper">
        <EuiTitle size="m">
          <h3>
            <FormattedMessage
              id="integrations.noIntegrations"
              defaultMessage="No integrations available"
            />
          </h3>
        </EuiTitle>
      </div>
    );
  }

  return (
    <div >
      <EuiSpacer size="l" />

      <div className="integrations-grid" role="list">
        {integrationsData.map((item) => (
          <EuiPanel
            key={item.id}
            className="integration-card"
            paddingSize="l"
            hasShadow={false}
            hasBorder={true}
            role="listitem"
            aria-label={`Integration: ${item.name}`}
          >
            <div className="card-logo">
              <LogoPlaceholder name={item.name} color={item.color} />
            </div>

            <div className="card-footer">
              {renderCardAction(item.status, item.name)}
            </div>
          </EuiPanel>
        ))}
      </div>
    </div>
  );
};

export default React.memo(IntegrationsList);
