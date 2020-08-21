"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreceivedLookupBatches = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const parkingDB_1 = require("../parkingDB");
exports.getUnreceivedLookupBatches = (includeUnlocked) => {
    const db = sqlite(parkingDB_1.dbPath, {
        readonly: true
    });
    const batches = db.prepare("select b.batchID, b.batchDate, b.lockDate, b.sentDate, count(e.batchID) as batchEntryCount" +
        " from LicencePlateLookupBatches b" +
        " left join LicencePlateLookupBatchEntries e on b.batchID = e.batchID" +
        " where b.recordDelete_timeMillis is null" +
        " and b.receivedDate is null" +
        (includeUnlocked ? "" : " and b.lockDate is not null") +
        " group by b.batchID, b.batchDate, b.lockDate, b.sentDate" +
        " order by b.batchID desc")
        .all();
    db.close();
    for (const batch of batches) {
        batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate);
        batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate);
        batch.sentDateString = dateTimeFns.dateIntegerToString(batch.sentDate);
    }
    return batches;
};
