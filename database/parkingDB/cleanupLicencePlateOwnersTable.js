import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export default function cleanupLicencePlateOwnersTable(recordDeleteTimeMillis) {
    const database = sqlite(databasePath);
    database
        .prepare(`delete from LicencePlateOwners
        where recordDelete_timeMillis is not null
        and recordDelete_timeMillis < ?`)
        .run(recordDeleteTimeMillis);
    database.close();
    return true;
}
