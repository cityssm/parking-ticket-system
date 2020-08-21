"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreParkingTicket = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.restoreParkingTicket = (ticketID, reqSession) => {
    const db = sqlite(databasePaths_1.parkingDB);
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
