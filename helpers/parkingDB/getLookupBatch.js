"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLookupBatch = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const databasePaths_1 = require("../../data/databasePaths");
exports.getLookupBatch = (batchID_or_negOne) => {
    const db = sqlite(databasePaths_1.parkingDB, {
        readonly: true
    });
    const baseBatchSQL = "select batchID, batchDate, lockDate, sentDate, receivedDate," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
        " from LicencePlateLookupBatches" +
        " where recordDelete_timeMillis is null";
    let batch;
    if (batchID_or_negOne === -1) {
        batch = db.prepare(baseBatchSQL +
            " and lockDate is null" +
            " order by batchID desc" +
            " limit 1")
            .get();
    }
    else {
        batch = db.prepare(baseBatchSQL +
            " and batchID = ?")
            .get(batchID_or_negOne);
    }
    if (!batch) {
        db.close();
        return null;
    }
    batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate);
    batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate);
    batch.sentDateString = dateTimeFns.dateIntegerToString(batch.sentDate);
    batch.receivedDateString = dateTimeFns.dateIntegerToString(batch.receivedDate);
    batch.batchEntries = db.prepare("select e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber," +
        " e.ticketID, t.ticketNumber, t.issueDate" +
        " from LicencePlateLookupBatchEntries e" +
        " left join ParkingTickets t on e.ticketID = t.ticketID" +
        " where e.batchID = ?" +
        " order by e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber")
        .all(batch.batchID);
    db.close();
    return batch;
};
