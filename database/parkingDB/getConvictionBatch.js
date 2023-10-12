import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export function getConvictionBatch(batchID_or_negOne) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const baseBatchSQL = 'select batchID, batchDate, lockDate, sentDate,' +
        ' recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis' +
        ' from ParkingTicketConvictionBatches' +
        ' where recordDelete_timeMillis is null';
    const batch = batchID_or_negOne === -1
        ? database
            .prepare(baseBatchSQL +
            ' and lockDate is null' +
            ' order by batchID desc' +
            ' limit 1')
            .get()
        : database
            .prepare(baseBatchSQL + ' and batchID = ?')
            .get(batchID_or_negOne);
    if (batch === undefined) {
        database.close();
        return undefined;
    }
    batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate);
    batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate);
    batch.sentDateString = dateTimeFns.dateIntegerToString(batch.sentDate);
    batch.batchEntries = database
        .prepare('select s.statusIndex,' +
        ' s.statusDate, s.statusTime,' +
        ' t.ticketID, t.ticketNumber, t.issueDate,' +
        ' t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber,' +
        ' s.recordCreate_userName, s.recordCreate_timeMillis, s.recordUpdate_userName, s.recordUpdate_timeMillis' +
        ' from ParkingTicketStatusLog s' +
        ' left join ParkingTickets t on s.ticketID = t.ticketID' +
        ' where s.recordDelete_timeMillis is null' +
        " and s.statusKey = 'convictionBatch' and s.statusField = ?" +
        ' order by t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber')
        .all(batch.batchID.toString());
    for (const batchEntry of batch.batchEntries) {
        batchEntry.statusDateString = dateTimeFns.dateIntegerToString(batchEntry.statusDate);
        batchEntry.statusTimeString = dateTimeFns.timeIntegerToString(batchEntry.statusTime);
        batchEntry.issueDateString = dateTimeFns.dateIntegerToString(batchEntry.issueDate);
    }
    database.close();
    return batch;
}
export default getConvictionBatch;