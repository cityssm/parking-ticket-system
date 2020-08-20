"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveParkingTicket = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const parkingDB_1 = require("../parkingDB");
exports.resolveParkingTicket = (ticketID, reqSession) => {
    const db = sqlite(parkingDB_1.dbPath);
    const rightNow = new Date();
    const info = db.prepare("update ParkingTickets" +
        " set resolvedDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where ticketID = ?" +
        " and resolvedDate is null" +
        " and recordDelete_timeMillis is null")
        .run(dateTimeFns.dateToInteger(rightNow), reqSession.user.userName, rightNow.getTime(), ticketID);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
