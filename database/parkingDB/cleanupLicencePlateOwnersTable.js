import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export function cleanupLicencePlateOwnersTable(recordDelete_timeMillis) {
    const database = sqlite(databasePath);
    database
        .prepare(`delete from LicencePlateOwners
        where recordDelete_timeMillis is not null
        and recordDelete_timeMillis < ?`)
        .run(recordDelete_timeMillis);
    database.close();
    return true;
}
export default cleanupLicencePlateOwnersTable;
