import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export function acknowledgeLookupErrorLogEntry(batchID, logIndex, sessionUser) {
    const database = sqlite(databasePath);
    const info = database
        .prepare(`update LicencePlateLookupErrorLog
        set isAcknowledged = 1,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and batchID = ?
        and logIndex = ?
        and isAcknowledged = 0`)
        .run(sessionUser.userName, Date.now(), batchID, logIndex);
    database.close();
    return info.changes > 0;
}
export default acknowledgeLookupErrorLogEntry;
