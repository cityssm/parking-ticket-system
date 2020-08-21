"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lockConvictionBatch = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const parkingDB_1 = require("../parkingDB");
exports.lockConvictionBatch = (batchID, reqSession) => {
    const db = sqlite(parkingDB_1.dbPath);
    const rightNow = new Date();
    const lockDate = dateTimeFns.dateToInteger(rightNow);
    const info = db
        .prepare("update ParkingTicketConvictionBatches" +
        " set lockDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where recordDelete_timeMillis is null" +
        " and batchID = ?" +
        " and lockDate is null")
        .run(lockDate, reqSession.user.userName, rightNow.getTime(), batchID);
    db.close();
    return {
        success: info.changes > 0,
        lockDate,
        lockDateString: dateTimeFns.dateIntegerToString(lockDate)
    };
};
