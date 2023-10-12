import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export const clearLookupBatch = (batchID, requestSession) => {
    const database = sqlite(databasePath);
    const canUpdateBatch = database
        .prepare(`update LicencePlateLookupBatches
        set recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where batchID = ?
        and recordDelete_timeMillis is null
        and lockDate is null`)
        .run(requestSession.user.userName, Date.now(), batchID).changes;
    if (canUpdateBatch === 0) {
        database.close();
        return {
            success: false,
            message: 'Batch cannot be updated.'
        };
    }
    database
        .prepare('delete from LicencePlateLookupBatchEntries where batchID = ?')
        .run(batchID);
    database.close();
    return {
        success: true
    };
};
export default clearLookupBatch;
