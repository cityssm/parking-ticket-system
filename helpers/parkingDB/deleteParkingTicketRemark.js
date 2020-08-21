"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteParkingTicketRemark = void 0;
const sqlite = require("better-sqlite3");
const parkingDB_1 = require("../parkingDB");
exports.deleteParkingTicketRemark = (ticketID, remarkIndex, reqSession) => {
    const db = sqlite(parkingDB_1.dbPath);
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
