import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export default function removeLicencePlateFromLookupBatch(requestBody, sessionUser) {
    const database = sqlite(databasePath);
    const canUpdateBatch = database
        .prepare(`update LicencePlateLookupBatches
        set recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where batchId = ?
        and recordDelete_timeMillis is null
        and lockDate is null`)
        .run(sessionUser.userName, Date.now(), requestBody.batchId).changes;
    if (canUpdateBatch === 0) {
        database.close();
        return {
            success: false,
            message: 'Batch cannot be updated.'
        };
    }
    const info = database
        .prepare(`delete from LicencePlateLookupBatchEntries
        where batchId = ?
        and ticketId = ?
        and licencePlateCountry = ?
        and licencePlateProvince = ?
        and licencePlateNumber = ?`)
        .run(requestBody.batchId, requestBody.ticketId, requestBody.licencePlateCountry, requestBody.licencePlateProvince, requestBody.licencePlateNumber);
    database.close();
    return info.changes > 0
        ? {
            success: true
        }
        : {
            success: false,
            message: 'Licence plate not removed from the batch.'
        };
}
