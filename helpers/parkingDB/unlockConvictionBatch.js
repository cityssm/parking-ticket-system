"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlockConvictionBatch = void 0;
const sqlite = require("better-sqlite3");
const parkingDB_1 = require("../parkingDB");
exports.unlockConvictionBatch = (batchID, reqSession) => {
    const db = sqlite(parkingDB_1.dbPath);
    const rightNowMillis = Date.now();
    const info = db
        .prepare("update ParkingTicketConvictionBatches" +
        " set lockDate = null," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where recordDelete_timeMillis is null" +
        " and batchID = ?" +
        " and lockDate is not null" +
        " and sentDate is null")
        .run(reqSession.user.userName, rightNowMillis, batchID);
    db.close();
    return info.changes > 0;
};
