const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'Audit-App',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

