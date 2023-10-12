import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export const getUnacknowledgedLookupErrorLog = (batchID_or_negOne, logIndex_or_negOne) => {
    const database = sqlite(databasePath, {
        readonly: true
    });
    let parameters = [];
    if (batchID_or_negOne !== -1 && logIndex_or_negOne !== -1) {
        parameters = [batchID_or_negOne, logIndex_or_negOne];
    }
    const logEntries = database
        .prepare('select l.batchID, l.logIndex,' +
        ' l.licencePlateCountry, l.licencePlateProvince, l.licencePlateNumber, l.recordDate,' +
        ' l.errorCode, l.errorMessage,' +
        ' e.ticketID, t.ticketNumber, t.issueDate, t.vehicleMakeModel' +
        ' from LicencePlateLookupErrorLog l' +
        (' inner join LicencePlateLookupBatches b' +
            ' on l.batchID = b.batchID' +
            ' and b.recordDelete_timeMillis is null') +
        (' inner join LicencePlateLookupBatchEntries e' +
            ' on b.batchID = e.batchID' +
            ' and l.licencePlateCountry = e.licencePlateCountry' +
            ' and l.licencePlateProvince = e.licencePlateProvince' +
            ' and l.licencePlateNumber = e.licencePlateNumber') +
        (' inner join ParkingTickets t' +
            ' on e.ticketID = t.ticketID' +
            ' and e.licencePlateCountry = t.licencePlateCountry' +
            ' and e.licencePlateProvince = t.licencePlateProvince' +
            ' and e.licencePlateNumber = t.licencePlateNumber' +
            ' and t.recordDelete_timeMillis is null' +
            ' and t.resolvedDate is null') +
        ' where l.recordDelete_timeMillis is null' +
        ' and l.isAcknowledged = 0' +
        (parameters.length > 0 ? ' and l.batchID = ? and l.logIndex = ?' : ''))
        .all(parameters);
    database.close();
    for (const logEntry of logEntries) {
        logEntry.recordDateString = dateTimeFns.dateIntegerToString(logEntry.recordDate);
        logEntry.issueDateString = dateTimeFns.dateIntegerToString(logEntry.issueDate);
    }
    return logEntries;
};
export default getUnacknowledgedLookupErrorLog;
