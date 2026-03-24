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
  EuiButtonIcon,
  EuiHealth,
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
  EuiToolTip,
  EuiIconTip,
  EuiText,
} from '@elastic/eui';
import { CoreStart } from '../../../../src/core/public';
import {IntegrationIcon} from "./integrations_list/integration_icon";

interface Device {
  name: string;
  connection: string;
  groups_filter: string;
  allowed_ips: string;
  rules_file?: string;
  decoders_file?: string;
}

export interface DeviceGroupFilter {
  title: string;
  models: string[];
  value: string | null;
  icon?: string;
  description?: string;
}

interface CustomGroup {
  uid: string;
  value: string;
  title: string;
  models: string[];
  description: string;
  page: string;
  icon: string;
  created_at: string;
}

interface DevicesGroupPageProps {
  basename: string;
  pageTitle: string;
  pageId: string;
  filters: DeviceGroupFilter[];
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
}

export const DevicesGroupPage = ({
  basename,
  pageTitle,
  pageId,
  filters,
  notifications,
  http,
}: DevicesGroupPageProps) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [customGroups, setCustomGroups] = useState<CustomGroup[]>([]);
  const [modalFilterIndex, setModalFilterIndex] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formIp, setFormIp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualPopoverIndex, setManualPopoverIndex] = useState<number | null>(null);

  // Custom group creation dialog state
  const [isCustomGroupModalOpen, setIsCustomGroupModalOpen] = useState(false);
  const [customGroupName, setCustomGroupName] = useState('');
  const [customGroupModels, setCustomGroupModels] = useState('');
  const [customGroupDescription, setCustomGroupDescription] = useState('');
  const [isCustomGroupSubmitting, setIsCustomGroupSubmitting] = useState(false);

  const fetchDevices = async () => {
    try {
      const result = await http.get('/api/integrations/device');
      setDevices(result || []);
    } catch (error) {
      notifications.toasts.addError(error, { title: 'Failed to load devices' });
    }
  };

  const fetchCustomGroups = async () => {
    try {
      const result = await http.get('/api/integrations/custom-group', {
        query: { page: pageId },
      });
      setCustomGroups(result || []);
    } catch (error) {
      notifications.toasts.addError(error, { title: 'Failed to load custom groups' });
    }
  };

  useEffect(() => {
    fetchDevices();
    fetchCustomGroups();
  }, []);

  // Merge static filters with custom groups
  const allFilters: (DeviceGroupFilter & { customGroupUid?: string })[] = [
    ...filters,
    ...customGroups.map((g) => ({
      title: g.title,
      models: g.models,
      value: g.value,
      icon: g.icon,
      description: g.description,
      customGroupUid: g.uid,
    })),
  ];

  const openModal = (index: number) => {
    setFormName('');
    setFormIp('');
    setModalFilterIndex(index);
  };

  const closeModal = () => setModalFilterIndex(null);

  const handleSubmit = async () => {
    if (modalFilterIndex === null) return;
    const filter = allFilters[modalFilterIndex];
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

  const openCustomGroupModal = () => {
    setCustomGroupName('');
    setCustomGroupModels('');
    setCustomGroupDescription('');
    setIsCustomGroupModalOpen(true);
  };

  const closeCustomGroupModal = () => setIsCustomGroupModalOpen(false);

  const handleCustomGroupSubmit = async () => {
    setIsCustomGroupSubmitting(true);
    try {
      const decodedPageTitle = pageTitle.replace(/&amp;/g, '&');
      const models = customGroupModels
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);

      await http.post('/api/integrations/custom-group', {
        body: JSON.stringify({
          value: customGroupName,
          title: `${decodedPageTitle} Custom`,
          models,
          description: customGroupDescription,
          page: pageId,
        }),
      });
      closeCustomGroupModal();
      await fetchCustomGroups();
    } catch (error) {
      notifications.toasts.addError(error, { title: 'Failed to create custom group' });
    } finally {
      setIsCustomGroupSubmitting(false);
    }
  };

  const handleDeleteCustomGroup = async (uid: string) => {
    try {
      await http.delete('/api/integrations/custom-group', {
        query: { uid },
      });
      await Promise.all([fetchCustomGroups(), fetchDevices()]);
    } catch (error) {
      notifications.toasts.addError(error, { title: 'Failed to delete custom group' });
    }
  };

  const isValidCustomGroupName = /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(customGroupName);

  return (
    <Router basename={basename}>
      <I18nProvider>
        <>
          <div className="integrations-wrapper">
            <EuiPage restrictWidth="1000px">
              <EuiPageBody component="main">
                <EuiPageHeader>
                  <EuiTitle size="l">
                    <h1>{pageTitle}</h1>
                  </EuiTitle>
                </EuiPageHeader>
                <EuiPageContent>
                  <EuiPageContentBody grow={1}>
                    <EuiFlexGroup className="integrations-grid" gutterSize="m" wrap>
                      {allFilters.map((filter, index) => {
                        const connectedCount = devices.filter(
                          (d) => d.groups_filter === filter.value
                        ).length;
                        const isEnabled = filter.value !== null;
                        const isCustom = !!(filter as any).customGroupUid;

                        return (
                          <EuiFlexItem className="integration-item" key={index} grow={false}>
                            <EuiPanel className="integration-card" hasBorder paddingSize="m">
                              <EuiFlexGroup
                                className="integration-content"
                                direction="column"
                                alignItems="center"
                                gutterSize="s"
                              >
                                {isCustom && (
                                  <div className="custom-group-delete">
                                    <EuiButtonIcon
                                      iconType="trash"
                                      color="danger"
                                      aria-label="Delete custom group"
                                      onClick={() =>
                                        handleDeleteCustomGroup(
                                          (filter as any).customGroupUid
                                        )
                                      }
                                    />
                                  </div>
                                )}
                                {filter.icon && (
                                  <IntegrationIcon name={filter.icon}/>
                                )}
                                <EuiFlexItem grow={false}>
                                  <EuiToolTip
                                    position="top"
                                    content={
                                      filter.models.length > 0
                                        ? filter.models.join(', ')
                                        : undefined
                                    }
                                  >
                                    <EuiTitle size="xs" style={{ textAlign: 'center'}}>
                                      <h3
                                        style={{
                                          cursor: filter.models.length > 0 ? 'help' : 'default',

                                        }}
                                      >
                                        {filter.title}
                                      </h3>
                                    </EuiTitle>
                                  </EuiToolTip>
                                </EuiFlexItem>
                                {isEnabled ? (
                                  <>
                                    <EuiFlexItem grow={false}>
                                      <EuiButton
                                        size="s"
                                        className="connect-btn"
                                        onClick={() => openModal(index)}
                                      >
                                        Connect
                                      </EuiButton>
                                    </EuiFlexItem>
                                    <EuiFlexItem grow={false}>
                                      <EuiHealth color={connectedCount > 0 ? 'success' : 'subdued'}>
                                        Connected: {connectedCount}
                                      </EuiHealth>
                                    </EuiFlexItem>
                                    <EuiFlexItem grow={false}>
                                      <EuiButtonEmpty
                                        size="s"
                                        href={`/app/integration-${filter.value!.replace(/_/g, '-')}`}
                                        iconType="dashboardApp"
                                      >
                                        Dashboard
                                      </EuiButtonEmpty>
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

                      {/* Add Custom Group card */}
                      <EuiFlexItem className="integration-item" grow={false}>
                        <EuiPanel
                          className="integration-card integration-card--add-custom"
                          hasBorder
                          paddingSize="m"
                          onClick={openCustomGroupModal}
                        >
                          <EuiFlexGroup
                            className="integration-content"
                            direction="column"
                            alignItems="center"
                            justifyContent="center"
                            gutterSize="s"
                          >
                            <EuiFlexItem grow={false}>
                              <EuiText size="m" color="subdued" textAlign="center">
                                <span style={{ fontSize: '48px', lineHeight: 1 }}>+</span>
                              </EuiText>
                            </EuiFlexItem>
                            <EuiFlexItem grow={false}>
                              <EuiTitle size="xs">
                                <h3 style={{ textAlign: 'center', color: '#69707D' }}>
                                  Add Custom Group
                                </h3>
                              </EuiTitle>
                            </EuiFlexItem>
                          </EuiFlexGroup>
                        </EuiPanel>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiPageContentBody>
                </EuiPageContent>
              </EuiPageBody>
            </EuiPage>
          </div>

          {/* Add Device modal */}
          {modalFilterIndex !== null && (
            <EuiModal onClose={closeModal}>
              <EuiModalHeader>
                <EuiModalHeaderTitle>
                  Add Device — {allFilters[modalFilterIndex].title}
                </EuiModalHeaderTitle>
              </EuiModalHeader>
              <EuiModalBody>
                <EuiForm>
                  <EuiFormRow
                    label="Device name"
                    labelAppend={
                      allFilters[modalFilterIndex].description ? (
                        <EuiIconTip
                          content={allFilters[modalFilterIndex].description}
                          position="right"
                          type="questionInCircle"
                        />
                      ) : undefined
                    }
                  >
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

          {/* Create Custom Group modal */}
          {isCustomGroupModalOpen && (
            <EuiModal onClose={closeCustomGroupModal}>
              <EuiModalHeader>
                <EuiModalHeaderTitle>Create Custom Group</EuiModalHeaderTitle>
              </EuiModalHeader>
              <EuiModalBody>
                <EuiForm>
                  <EuiFormRow
                    label="Group name"
                    helpText="Latin letters, digits, hyphens, and underscores only (e.g. my-device)"
                    isInvalid={customGroupName.length > 0 && !isValidCustomGroupName}
                    error={
                      customGroupName.length > 0 && !isValidCustomGroupName
                        ? 'Must start with a letter, only Latin letters, digits, hyphens, and underscores'
                        : undefined
                    }
                  >
                    <EuiFieldText
                      value={customGroupName}
                      onChange={(e) => setCustomGroupName(e.target.value)}
                      placeholder="e.g. my-custom-device"
                      isInvalid={customGroupName.length > 0 && !isValidCustomGroupName}
                    />
                  </EuiFormRow>
                  <EuiSpacer size="m" />
                  <EuiFormRow
                    label="Models"
                    helpText="Comma-separated list of supported models"
                  >
                    <EuiFieldText
                      value={customGroupModels}
                      onChange={(e) => setCustomGroupModels(e.target.value)}
                      placeholder="e.g. Model A, Model B"
                    />
                  </EuiFormRow>
                  <EuiSpacer size="m" />
                  <EuiFormRow label="Description">
                    <EuiFieldText
                      value={customGroupDescription}
                      onChange={(e) => setCustomGroupDescription(e.target.value)}
                      placeholder="Description for this device group"
                    />
                  </EuiFormRow>
                </EuiForm>
              </EuiModalBody>
              <EuiModalFooter>
                <EuiButtonEmpty onClick={closeCustomGroupModal}>Cancel</EuiButtonEmpty>
                <EuiButton
                  fill
                  onClick={handleCustomGroupSubmit}
                  isLoading={isCustomGroupSubmitting}
                  isDisabled={!customGroupName || !isValidCustomGroupName}
                >
                  Create Group
                </EuiButton>
              </EuiModalFooter>
            </EuiModal>
          )}
        </>
      </I18nProvider>
    </Router>
  );
};
