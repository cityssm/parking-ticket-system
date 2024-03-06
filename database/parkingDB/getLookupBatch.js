import { dateIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export default function getLookupBatch(batchId_or_negOne) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const baseBatchSQL = `select batchId, batchDate, lockDate, sentDate, receivedDate, mto_includeLabels,
    recordCreate_userName, recordCreate_timeMillis,
    recordUpdate_userName, recordUpdate_timeMillis
    from LicencePlateLookupBatches
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
    batch.lockDateString = dateIntegerToString(batch.lockDate);
    batch.sentDateString = dateIntegerToString(batch.sentDate);
    batch.receivedDateString = dateIntegerToString(batch.receivedDate);
    batch.batchEntries = database
        .prepare(`select e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber,
        e.ticketId, t.ticketNumber, t.issueDate
        from LicencePlateLookupBatchEntries e
        left join ParkingTickets t on e.ticketId = t.ticketId
        where e.batchId = ?
        order by e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber`)
        .all(batch.batchId);
    database.close();
    return batch;
}
