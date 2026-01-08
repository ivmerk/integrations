import React from 'react';
import {
  EuiPanel,
  EuiButton,
  EuiHealth,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover } from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import './integrations.scss';
import {IntegrationIcon} from "./integration_icon";
import { integrationsData } from './integration_data';
import { IntegrationItem } from './integration_data';
import {getScopedIntegration} from "./get-scopd-integration";
import { CoreStart } from '../../../../src/core/public';

interface IntegrationsListProps {
  savedObjects: CoreStart['savedObjects'];
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
}

const IntegrationsList: React.FC = ({savedObjects, notifications, http}) => {

  const [scopdRulesCondition, setScopdRulesCondition] = React.useState<'enable' | 'disable'>('disable');
  const [popoverState, setPopoverState] = React.useState<{ isOpen: boolean; itemId: number | null }>({
    isOpen: false,
    itemId: null
  });

  const scopdItemIntegrationsData = integrationsData.find(item => item.id === 1);
  if (scopdItemIntegrationsData) {
    scopdItemIntegrationsData.button = scopdRulesCondition;
    scopdItemIntegrationsData.buttonClickHandler = () => {
      getScopedIntegration({savedObjects, notifications, http});
      setScopdRulesCondition(scopdRulesCondition === 'enable' ? 'disable' : 'enable');
      console.log(`Connect!!! to ${scopdItemIntegrationsData.name} clicked`)};
      console.log(scopdRulesCondition);
  }

  const onButtonManualClick = (itemId: number) => {
    setPopoverState({
      isOpen: !popoverState.isOpen,
      itemId: popoverState.itemId === itemId ? null : itemId
    });
  };

  const closePopover = () => {
    setPopoverState({ isOpen: false, itemId: null });
  };
  const renderCardAction = (type: IntegrationItem['type'], name: string, id: number) => {
    const integration = integrationsData.find(item => item.id === id);
    switch (type) {
      case 'connected':
        return (
          <div className="card-type">
            <EuiHealth color="success">
              <FormattedMessage id="integrations.type.connected" defaultMessage="Connected" />
            </EuiHealth>
          </div>
        );
      case 'forward':
        return (
          <EuiButton
            size="s"
            className="forward-btn"
            onClick={() => integration?.forwardUrl && window.open(integration.forwardUrl, '_blank')}
            aria-label={`Open ${name} documentation`}
          >
            <FormattedMessage id="integrations.actions.documentation" defaultMessage="View documentation" />
          </EuiButton>
        );
      case 'auto':
        return (
          <EuiButton
            size="s"
            fill={false}
            className="connect-btn"
            onClick={() => {console.log(`Connect to ${integration?.name} clicked`, integrationsData);
              integration?.buttonClickHandler()}}
            aria-label={`Connect to ${name}`}
          >
            <FormattedMessage id="integrations.actions.connect" defaultMessage="Connect" />
          </EuiButton>
        );
      case 'manual':
        return (
          <EuiPopover
            button={
              <EuiButton
                size="s"
                className="manual-btn"
                onClick={() => onButtonManualClick(id)}
                aria-label={`Configure ${name} manually`}
              >
                <FormattedMessage id="integrations.actions.manual" defaultMessage="Configure manually" />
              </EuiButton>
            }
            isOpen={popoverState.isOpen && popoverState.itemId === id}
            closePopover={closePopover}
            anchorPosition="downCenter"
          >
            <div style={{ padding: '16px', maxWidth: '300px' }}>
             This feature will be available late
            </div>
          </EuiPopover>
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
              {renderCardAction(integration.type, integration.name, integration.id)}
          </EuiFlexGroup>
        </EuiPanel>
        </EuiFlexItem>
      ))}
    </EuiFlexGroup>
  );
};

export default IntegrationsList;
