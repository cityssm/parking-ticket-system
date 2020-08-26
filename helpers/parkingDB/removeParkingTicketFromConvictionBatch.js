"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeParkingTicketFromConvictionBatch = void 0;
const sqlite = require("better-sqlite3");
const isConvictionBatchUpdatable_1 = require("./isConvictionBatchUpdatable");
const databasePaths_1 = require("../../data/databasePaths");
exports.removeParkingTicketFromConvictionBatch = (batchID, ticketID, reqSession) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const batchIsAvailable = isConvictionBatchUpdatable_1.isConvictionBatchUpdatableWithDB(db, batchID);
    if (!batchIsAvailable) {
        db.close();
        return {
            success: false,
            message: "The batch cannot be updated."
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
