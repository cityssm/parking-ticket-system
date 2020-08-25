"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveParkingTicket = exports.resolveParkingTicketWithDB = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const databasePaths_1 = require("../../data/databasePaths");
exports.resolveParkingTicketWithDB = (db, ticketID, reqSession) => {
    const rightNow = new Date();
    const info = db.prepare("update ParkingTickets" +
        " set resolvedDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where ticketID = ?" +
        " and resolvedDate is null" +
        " and recordDelete_timeMillis is null")
        .run(dateTimeFns.dateToInteger(rightNow), reqSession.user.userName, rightNow.getTime(), ticketID);
    return {
        success: (info.changes > 0)
    };
};
exports.resolveParkingTicket = (ticketID, reqSession) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const success = exports.resolveParkingTicketWithDB(db, ticketID, reqSession);
    db.close();
    return {
        success
    };
};
