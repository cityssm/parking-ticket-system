import { dateIntegerToString, isValidDateInteger, timeIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export default function getConvictionBatch(batchId_or_negOne) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const baseBatchSQL = `select batchId, batchDate, lockDate, sentDate,
    recordCreate_userName, recordCreate_timeMillis,
    recordUpdate_userName, recordUpdate_timeMillis
    from ParkingTicketConvictionBatches
    where recordDelete_timeMillis is null`;
    const batch = batchId_or_negOne === -1
        ? database
            .prepare(`${baseBatchSQL}
              and lockDate is null
              order by batchId desc
              limit 1`)
            .get()
        : database
            .prepare(`${baseBatchSQL} and batchId = ?`)
            .get(batchId_or_negOne);
    if (batch === undefined) {
        database.close();
        return undefined;
    }
    batch.batchDateString = dateIntegerToString(batch.batchDate);
    batch.lockDateString = isValidDateInteger(batch.lockDate)
        ? dateIntegerToString(batch.lockDate)
        : '';
    batch.sentDateString = dateIntegerToString(batch.sentDate);
    batch.batchEntries = database
        .prepare(`select s.statusIndex,
        s.statusDate, s.statusTime,
        t.ticketId, t.ticketNumber, t.issueDate,
        t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber,
        s.recordCreate_userName, s.recordCreate_timeMillis,
        s.recordUpdate_userName, s.recordUpdate_timeMillis
        from ParkingTicketStatusLog s
        left join ParkingTickets t on s.ticketId = t.ticketId
        where s.recordDelete_timeMillis is null
        and s.statusKey = 'convictionBatch'
        and s.statusField = ?
        order by t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber`)
        .all(batch.batchId.toString());
    for (const batchEntry of batch.batchEntries) {
        batchEntry.statusDateString = dateIntegerToString(batchEntry.statusDate);
        batchEntry.statusTimeString = timeIntegerToString(batchEntry.statusTime);
        batchEntry.issueDateString = dateIntegerToString(batchEntry.issueDate);
    }
    database.close();
    return batch;
}
