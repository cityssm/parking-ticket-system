"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteParkingTicketStatus = void 0;
const sqlite = require("better-sqlite3");
const parkingDB_1 = require("../parkingDB");
exports.deleteParkingTicketStatus = (ticketID, statusIndex, reqSession) => {
    const db = sqlite(parkingDB_1.dbPath);
    const info = db.prepare("update ParkingTicketStatusLog" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where ticketID = ?" +
        " and statusIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, Date.now(), ticketID, statusIndex);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
