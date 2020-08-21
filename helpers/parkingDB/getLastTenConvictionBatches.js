"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastTenConvictionBatches = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const parkingDB_1 = require("../parkingDB");
exports.getLastTenConvictionBatches = () => {
    const db = sqlite(parkingDB_1.dbPath, {
        readonly: true
    });
    const batches = db
        .prepare("select batchID, batchDate, lockDate, sentDate," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
        " from ParkingTicketConvictionBatches" +
        " where recordDelete_timeMillis is null" +
        " order by batchID desc" +
        " limit 10")
        .all();
    db.close();
    for (const batch of batches) {
        batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate);
        batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate);
        batch.sentDateString = dateTimeFns.dateIntegerToString(batch.sentDate);
    }
    return batches;
};
