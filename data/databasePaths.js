import Debug from 'debug';
import * as configFunctions from '../helpers/functions.config.js';
const debug = Debug('parking-ticket-system:databasePaths');
export const useTestDatabases = configFunctions.getConfigProperty('application.useTestDatabases') ||
    process.env.TEST_DATABASES === 'true';
if (useTestDatabases) {
    debug('Using "-testing" databases.');
}
export const parkingDB_live = 'data/parking.db';
export const parkingDB_testing = 'data/parking-testing.db';
export const parkingDB = useTestDatabases ? parkingDB_testing : parkingDB_live;
export const nhtsaDB_live = 'data/nhtsa.db';
export const nhtsaDB_testing = 'data/nhtsa-testing.db';
export const nhtsaDB = useTestDatabases ? nhtsaDB_testing : nhtsaDB_live;
