import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nProvider } from '@osd/i18n/react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageHeader,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiButton,
  EuiButtonEmpty,
  EuiHealth,
  EuiText,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiSpacer,
  EuiPopover,
} from '@elastic/eui';
import { CoreStart } from '../../../../src/core/public';
import { routingSwitchingDevicesGroupsFilters } from '../../../common/constants';

interface Device {
  name: string;
  connection: string;
  groups_filter: string;
  allowed_ips: string;
  rules_file: string;
  decoders_file: string;
}

interface RoutingSwitchingPageProps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
}

export const RoutingSwitchingPage = ({ basename, notifications, http }: RoutingSwitchingPageProps) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [modalFilterIndex, setModalFilterIndex] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formIp, setFormIp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualPopoverIndex, setManualPopoverIndex] = useState<number | null>(null);

  const fetchDevices = async () => {
    try {
      const result = await http.get('/api/integrations/device');
      setDevices(result || []);
    } catch (error) {
      notifications.toasts.addError(error, { title: 'Failed to load devices' });
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const openModal = (index: number) => {
    setFormName('');
    setFormIp('');
    setModalFilterIndex(index);
  };

  const closeModal = () => setModalFilterIndex(null);

  const handleSubmit = async () => {
    if (modalFilterIndex === null) return;
    const filter = routingSwitchingDevicesGroupsFilters[modalFilterIndex];
    setIsSubmitting(true);
    try {
      await http.post('/api/integrations/device', {
        body: JSON.stringify({
          name: formName,
          connection: 'syslog',
          groups_filter: filter.value,
          allowed_ips: formIp,
        }),
      });
      closeModal();
      await fetchDevices();
    } catch (error) {
      notifications.toasts.addError(error, { title: 'Failed to add device' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Router basename={basename}>
      <I18nProvider>
        <>
        <div className="integrations-wrapper">
          <EuiPage restrictWidth="1000px">
            <EuiPageBody component="main">
              <EuiPageHeader>
                <EuiTitle size="l">
                  <h1>Routing &amp; Switching</h1>
                </EuiTitle>
              </EuiPageHeader>
              <EuiPageContent>
                <EuiPageContentBody grow={1}>
                  <EuiFlexGroup className="integrations-grid" gutterSize="m">
                    {routingSwitchingDevicesGroupsFilters.map((filter, index) => {
                      const connectedCount = devices.filter(
                        (d) => d.groups_filter === filter.value
                      ).length;
                      const isEnabled = filter.value !== null;

                      return (
                        <EuiFlexItem className="integration-item" key={index} grow={true}>
                          <EuiPanel
                            className="integration-card"
                            hasBorder
                            paddingSize="m"
                          >
                            <EuiFlexGroup
                              className="integration-content"
                              direction="column"
                              alignItems="center"
                              gutterSize="s"
                            >
                              <EuiFlexItem grow={false}>
                                <img
                                  src={filter.iconUrl}
                                  alt={filter.title}
                                  style={{ width: 64, height: 64, objectFit: 'contain' }}
                                />
                              </EuiFlexItem>
                              <EuiFlexItem grow={false}>
                                <EuiTitle size="xs">
                                  <h3>{filter.title}</h3>
                                </EuiTitle>
                              </EuiFlexItem>
                              {filter.models.length > 0 && (
                                <EuiFlexItem grow={false}>
                                  <EuiText size="xs" color="subdued" textAlign="center">
                                    <p>{filter.models.join(', ')}</p>
                                  </EuiText>
                                </EuiFlexItem>
                              )}
                              {isEnabled ? (
                                <>
                                  <EuiFlexItem grow={false}>
                                    <EuiHealth color={connectedCount > 0 ? 'success' : 'subdued'}>
                                      Connected: {connectedCount}
                                    </EuiHealth>
                                  </EuiFlexItem>
                                  <EuiFlexItem grow={false}>
                                    <EuiButton
                                      size="s"
                                      className="connect-btn"
                                      onClick={() => openModal(index)}
                                    >
                                      Connect
                                    </EuiButton>
                                  </EuiFlexItem>
                                </>
                              ) : (
                                <EuiFlexItem grow={false}>
                                  <EuiPopover
                                    button={
                                      <EuiButton
                                        size="s"
                                        className="manual-btn"
                                        onClick={() =>
                                          setManualPopoverIndex(
                                            manualPopoverIndex === index ? null : index
                                          )
                                        }
                                      >
                                        Configure manually
                                      </EuiButton>
                                    }
                                    isOpen={manualPopoverIndex === index}
                                    closePopover={() => setManualPopoverIndex(null)}
                                    anchorPosition="downCenter"
                                  >
                                    <div style={{ padding: '16px', maxWidth: '300px' }}>
                                      This feature will be available later
                                    </div>
                                  </EuiPopover>
                                </EuiFlexItem>
                              )}
                            </EuiFlexGroup>
                          </EuiPanel>
                        </EuiFlexItem>
                      );
                    })}
                  </EuiFlexGroup>
                </EuiPageContentBody>
              </EuiPageContent>
            </EuiPageBody>
          </EuiPage>
        </div>

        {modalFilterIndex !== null && (
          <EuiModal onClose={closeModal}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                Add Device — {routingSwitchingDevicesGroupsFilters[modalFilterIndex].title}
              </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
              <EuiForm>
                <EuiFormRow label="Device name">
                  <EuiFieldText
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter device name"
                  />
                </EuiFormRow>
                <EuiSpacer size="m" />
                <EuiFormRow label="IP address">
                  <EuiFieldText
                    value={formIp}
                    onChange={(e) => setFormIp(e.target.value)}
                    placeholder="e.g. 192.168.2.1"
                  />
                </EuiFormRow>
              </EuiForm>
            </EuiModalBody>
            <EuiModalFooter>
              <EuiButtonEmpty onClick={closeModal}>Cancel</EuiButtonEmpty>
              <EuiButton
                fill
                onClick={handleSubmit}
                isLoading={isSubmitting}
                isDisabled={!formName || !formIp}
              >
                Add Device
              </EuiButton>
            </EuiModalFooter>
          </EuiModal>
        )}
        </>
      </I18nProvider>
    </Router>
  );
};
