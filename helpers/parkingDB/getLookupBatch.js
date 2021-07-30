import sqlite from "better-sqlite3";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { parkingDB as databasePath } from "../../data/databasePaths.js";
export const getLookupBatch = (batchID_or_negOne) => {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const baseBatchSQL = "select batchID, batchDate, lockDate, sentDate, receivedDate," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
        " from LicencePlateLookupBatches" +
        " where recordDelete_timeMillis is null";
    const batch = batchID_or_negOne === -1
        ? database.prepare(baseBatchSQL +
            " and lockDate is null" +
            " order by batchID desc" +
            " limit 1")
            .get()
        : database.prepare(baseBatchSQL +
            " and batchID = ?")
            .get(batchID_or_negOne);
    if (!batch) {
        database.close();
        return undefined;
    }
    batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate);
    batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate);
    batch.sentDateString = dateTimeFns.dateIntegerToString(batch.sentDate);
    batch.receivedDateString = dateTimeFns.dateIntegerToString(batch.receivedDate);
    batch.batchEntries = database.prepare("select e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber," +
        " e.ticketID, t.ticketNumber, t.issueDate" +
        " from LicencePlateLookupBatchEntries e" +
        " left join ParkingTickets t on e.ticketID = t.ticketID" +
        " where e.batchID = ?" +
        " order by e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber")
        .all(batch.batchID);
    database.close();
    return batch;
};
export default getLookupBatch;
