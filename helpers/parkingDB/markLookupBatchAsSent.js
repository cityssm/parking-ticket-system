"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markLookupBatchAsSent = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const parkingDB_1 = require("../parkingDB");
exports.markLookupBatchAsSent = (batchID, reqSession) => {
    const db = sqlite(parkingDB_1.dbPath);
    const rightNow = new Date();
    const info = db.prepare("update LicencePlateLookupBatches" +
        " set sentDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where batchID = ?" +
        " and recordDelete_timeMillis is null" +
        " and lockDate is not null" +
        " and sentDate is null")
        .run(dateTimeFns.dateToInteger(rightNow), reqSession.user.userName, rightNow.getTime(), batchID);
    db.close();
    return (info.changes > 0);
};
