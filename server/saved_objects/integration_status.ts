import { SavedObjectsType } from 'src/core/server';

export const integrationStatusType = 'integration-status';

export const integrationStatusSavedObject: SavedObjectsType = {
  name: integrationStatusType,
  hidden: false,
  namespaceType: 'single',
  convertToAliasScript: `ctx._id = ctx._source.type + ':' + ctx._id`,
  mappings: {
    dynamic: false,
    properties: {
      integration: { type: 'keyword' },
      enabled: { type: 'boolean' },
      updated_at: { type: 'date' },
    },
  },
  management: {
    importableAndExportable: true,
    getTitle: (savedObject) => `Integration Status: ${savedObject.attributes.integration}`,
  },
} as const;
