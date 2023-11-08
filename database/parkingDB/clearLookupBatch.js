import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export const clearLookupBatch = (batchId, sessionUser) => {
    const database = sqlite(databasePath);
    const canUpdateBatch = database
        .prepare(`update LicencePlateLookupBatches
        set recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where batchId = ?
        and recordDelete_timeMillis is null
        and lockDate is null`)
        .run(sessionUser.userName, Date.now(), batchId).changes;
    if (canUpdateBatch === 0) {
        database.close();
        return {
            success: false,
            message: 'Batch cannot be updated.'
        };
    }
    database
        .prepare('delete from LicencePlateLookupBatchEntries where batchId = ?')
        .run(batchId);
    database.close();
    return {
        success: true
    };
};
export default clearLookupBatch;
