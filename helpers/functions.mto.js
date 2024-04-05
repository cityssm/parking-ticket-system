import { MTOBatchWriter, parseMTOBatchResult } from '@cityssm/mto-handler';
import { dateIntegerToString, dateStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../data/databasePaths.js';
import getLookupBatch from '../database/parkingDB/getLookupBatch.js';
import markLookupBatchAsSent from '../database/parkingDB/markLookupBatchAsSent.js';
import { getConfigProperty } from './functions.config.js';
export async function importLicencePlateOwnership(batchId, ownershipData, sessionUser) {
    const parsedOwnershipData = await parseMTOBatchResult(ownershipData);
    const database = sqlite(databasePath);
    const batchRow = database
        .prepare(`select sentDate from LicencePlateLookupBatches
        where batchId = ?
        and recordDelete_timeMillis is null
        and lockDate is not null
        and sentDate is not null`)
        .get(batchId);
    if (batchRow === undefined) {
        database.close();
        return {
            success: false,
            message: `Batch #${batchId.toString()} is unavailable for imports.`
        };
    }
    else if (batchRow.sentDate !== dateStringToInteger(parsedOwnershipData.sentDate)) {
        database.close();
        return {
            success: false,
            message: 'The sent date in the batch record does not match the sent date in the file.'
        };
    }
    database
        .prepare('delete from LicencePlateLookupErrorLog where batchId = ?')
        .run(batchId);
    let insertedErrorCount = 0;
    let insertedRecordCount = 0;
    const rightNowMillis = Date.now();
    for (const ownershipDataRow of parsedOwnershipData.parsedResults) {
        insertedRecordCount += database
            .prepare(`insert or ignore into LicencePlateOwners (
            licencePlateCountry, licencePlateProvince, licencePlateNumber,
            recordDate, vehicleNCIC, vehicleYear, vehicleColor, licencePlateExpiryDate,
            ownerName1, ownerName2, ownerAddress, ownerCity, ownerProvince, ownerPostalCode, ownerGenderKey,
            driverLicenceNumber,
            recordCreate_userName, recordCreate_timeMillis,
            recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run('CA', 'ON', ownershipDataRow.licencePlateNumber, dateStringToInteger(parsedOwnershipData.recordDate), ownershipDataRow.vehicleMake, ownershipDataRow.vehicleYear, ownershipDataRow.vehicleColor, dateStringToInteger(ownershipDataRow.licencePlateExpiryDate), ownershipDataRow.ownerName1, ownershipDataRow.ownerName2, ownershipDataRow.ownerAddress, ownershipDataRow.ownerCity, ownershipDataRow.ownerProvince, ownershipDataRow.ownerPostalCode, ownershipDataRow.ownerGenderKey, ownershipDataRow.driverLicenceNumber, sessionUser.userName, rightNowMillis, sessionUser.userName, rightNowMillis).changes;
    }
    for (const [errorCount, ownershipDataErrorRow] of parsedOwnershipData.parsedResultsWithErrors.entries()) {
        insertedErrorCount += database
            .prepare(`insert or ignore into LicencePlateLookupErrorLog (
            batchId, logIndex, licencePlateCountry, licencePlateProvince, licencePlateNumber,
            recordDate, errorCode, errorMessage,
            recordCreate_userName, recordCreate_timeMillis,
            recordUpdate_userName, recordUpdate_timeMillis) 
          values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(batchId, errorCount, 'CA', 'ON', ownershipDataErrorRow.licencePlateNumber, dateStringToInteger(parsedOwnershipData.recordDate), ownershipDataErrorRow.errorCode, ownershipDataErrorRow.errorMessage, sessionUser.userName, rightNowMillis, sessionUser.userName, rightNowMillis).changes;
    }
    database
        .prepare(`update LicencePlateLookupBatches
        set receivedDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where batchId = ?`)
        .run(dateStringToInteger(parsedOwnershipData.recordDate), sessionUser.userName, rightNowMillis, batchId);
    database.close();
    return {
        success: true,
        rowCount: parsedOwnershipData.parsedResults.length +
            parsedOwnershipData.parsedResultsWithErrors.length,
        errorCount: parsedOwnershipData.parsedResultsWithErrors.length,
        insertedErrorCount,
        recordCount: parsedOwnershipData.parsedResults.length,
        insertedRecordCount
    };
}
function exportBatch(sentDate, includeLabels, batchEntries) {
    const batchWriter = new MTOBatchWriter({
        authorizedUser: getConfigProperty('mtoExportImport.authorizedUser'),
        includeLabels,
        sentDate: dateIntegerToString(sentDate)
    });
    for (const entry of batchEntries) {
        if (entry.ticketId === null) {
            continue;
        }
        batchWriter.addBatchEntry({
            licencePlateNumber: entry.licencePlateNumber ?? '',
            ticketNumber: entry.ticketNumber ?? '',
            issueDate: dateIntegerToString(entry.issueDate)
        });
    }
    return batchWriter.writeBatch();
}
export function exportLicencePlateBatch(batchId, sessionUser) {
    markLookupBatchAsSent(batchId, sessionUser);
    const batch = getLookupBatch(batchId);
    return exportBatch(batch.sentDate, batch.mto_includeLabels, batch.batchEntries);
}
