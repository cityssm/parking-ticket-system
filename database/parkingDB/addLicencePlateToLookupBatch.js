import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { getLookupBatch } from './getLookupBatch.js';
export const addLicencePlateToLookupBatch = (requestBody, sessionUser) => {
    const database = sqlite(databasePath);
    const canUpdateBatch = database
        .prepare(`update LicencePlateLookupBatches
        set recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where batchID = ?
        and recordDelete_timeMillis is null
        and lockDate is null`)
        .run(sessionUser.userName, Date.now(), requestBody.batchID).changes;
    if (canUpdateBatch === 0) {
        database.close();
        return {
            success: false,
            message: 'Batch cannot be updated.'
        };
    }
    const info = database
        .prepare('insert or ignore into LicencePlateLookupBatchEntries' +
        ' (batchID, licencePlateCountry, licencePlateProvince, licencePlateNumber, ticketID)' +
        ' values (?, ?, ?, ?, ?)')
        .run(requestBody.batchID, requestBody.licencePlateCountry, requestBody.licencePlateProvince, requestBody.licencePlateNumber, requestBody.ticketID);
    database.close();
    return info.changes > 0
        ? {
            success: true
        }
        : {
            success: false,
            message: 'Licence plate not added to the batch.  It may be already part of the batch.'
        };
};
export const addAllParkingTicketsToLookupBatch = (requestBody, sessionUser) => {
    const database = sqlite(databasePath);
    const canUpdateBatch = database
        .prepare('update LicencePlateLookupBatches' +
        ' set recordUpdate_userName = ?,' +
        ' recordUpdate_timeMillis = ?' +
        ' where batchID = ?' +
        ' and recordDelete_timeMillis is null' +
        ' and lockDate is null')
        .run(sessionUser.userName, Date.now(), requestBody.batchID).changes;
    if (canUpdateBatch === 0) {
        database.close();
        return {
            success: false,
            message: 'Batch cannot be updated.'
        };
    }
    const insertStmt = database.prepare('insert or ignore into LicencePlateLookupBatchEntries' +
        ' (batchID, licencePlateCountry, licencePlateProvince, licencePlateNumber, ticketID)' +
        ' select ? as batchID, licencePlateCountry, licencePlateProvince, licencePlateNumber, ticketID' +
        ' from ParkingTickets' +
        ' where recordDelete_timeMillis is null' +
        ' and ticketID = ?');
    for (const ticketID of requestBody.ticketIDs) {
        insertStmt.run(requestBody.batchID, ticketID);
    }
    database.close();
    return {
        success: true,
        batch: getLookupBatch(requestBody.batchID)
    };
};
export default addLicencePlateToLookupBatch;
