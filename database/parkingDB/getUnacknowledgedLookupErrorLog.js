import { dateIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export default function getUnacknowledgedLookupErrorLog(batchId_or_negOne, logIndex_or_negOne) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    let parameters = [];
    if (batchId_or_negOne !== -1 && logIndex_or_negOne !== -1) {
        parameters = [batchId_or_negOne, logIndex_or_negOne];
    }
    const logEntries = database
        .prepare(`select l.batchId, l.logIndex,
        l.licencePlateCountry, l.licencePlateProvince, l.licencePlateNumber,
        l.recordDate, l.errorCode, l.errorMessage,
        e.ticketId, t.ticketNumber, t.issueDate, t.vehicleMakeModel
        from LicencePlateLookupErrorLog l
        inner join LicencePlateLookupBatches b
          on l.batchId = b.batchId
          and b.recordDelete_timeMillis is null
        inner join LicencePlateLookupBatchEntries e
          on b.batchId = e.batchId
          and l.licencePlateCountry = e.licencePlateCountry
          and l.licencePlateProvince = e.licencePlateProvince
          and l.licencePlateNumber = e.licencePlateNumber
        inner join ParkingTickets t
          on e.ticketId = t.ticketId
          and e.licencePlateCountry = t.licencePlateCountry
          and e.licencePlateProvince = t.licencePlateProvince
          and e.licencePlateNumber = t.licencePlateNumber
          and t.recordDelete_timeMillis is null
          and t.resolvedDate is null
        where l.recordDelete_timeMillis is null
        and l.isAcknowledged = 0
        ${parameters.length > 0 ? ' and l.batchId = ? and l.logIndex = ?' : ''}`)
        .all(parameters);
    database.close();
    for (const logEntry of logEntries) {
        logEntry.recordDateString = dateIntegerToString(logEntry.recordDate);
        logEntry.issueDateString = dateIntegerToString(logEntry.issueDate);
    }
    return logEntries;
}
