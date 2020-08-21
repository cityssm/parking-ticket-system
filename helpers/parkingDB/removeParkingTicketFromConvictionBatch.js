"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeParkingTicketFromConvictionBatch = void 0;
const sqlite = require("better-sqlite3");
const parkingDB_1 = require("../parkingDB");
exports.removeParkingTicketFromConvictionBatch = (batchID, ticketID, reqSession) => {
    const db = sqlite(parkingDB_1.dbPath);
    const lockedBatchCheck = db
        .prepare("select lockDate from ParkingTicketConvictionBatches" +
        " where recordDelete_timeMillis is null" +
        " and batchID = ?")
        .get(batchID);
    if (!lockedBatchCheck) {
        db.close();
        return {
            success: false,
            message: "The batch is unavailable."
        };
    }
    else if (lockedBatchCheck.lockDate) {
        db.close();
        return {
            success: false,
            message: "The batch is locked and cannot be updated."
        };
    }
    const rightNowMillis = Date.now();
    const info = db
        .prepare("update ParkingTicketStatusLog" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " and statusKey in ('convicted', 'convictionBatch')" +
        " and statusField = ?")
        .run(reqSession.user.userName, rightNowMillis, ticketID, batchID.toString());
    db.close();
    return {
        success: info.changes > 0
    };
};