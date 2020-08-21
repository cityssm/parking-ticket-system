"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteParkingTicketRemark = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.deleteParkingTicketRemark = (ticketID, remarkIndex, reqSession) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const info = db.prepare("update ParkingTicketRemarks" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where ticketID = ?" +
        " and remarkIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, Date.now(), ticketID, remarkIndex);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
