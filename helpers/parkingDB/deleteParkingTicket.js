"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteParkingTicket = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.deleteParkingTicket = (ticketID, reqSession) => {
    const db = sqlite(databasePaths_1.parkingDB);
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
