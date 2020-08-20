"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteParkingTicket = void 0;
const sqlite = require("better-sqlite3");
const parkingDB_1 = require("../parkingDB");
exports.deleteParkingTicket = (ticketID, reqSession) => {
    const db = sqlite(parkingDB_1.dbPath);
    const info = db.prepare("update ParkingTickets" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where ticketID = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, Date.now(), ticketID);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
