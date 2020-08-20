"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreParkingTicket = void 0;
const sqlite = require("better-sqlite3");
const parkingDB_1 = require("../parkingDB");
exports.restoreParkingTicket = (ticketID, reqSession) => {
    const db = sqlite(parkingDB_1.dbPath);
    const info = db.prepare("update ParkingTickets" +
        " set recordDelete_userName = null," +
        " recordDelete_timeMillis = null," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where ticketID = ?" +
        " and recordDelete_timeMillis is not null")
        .run(reqSession.user.userName, Date.now(), ticketID);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
