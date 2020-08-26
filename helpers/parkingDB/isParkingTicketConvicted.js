"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isParkingTicketConvicted = exports.isParkingTicketConvictedWithDB = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.isParkingTicketConvictedWithDB = (db, ticketID) => {
    const convictedStatusCheck = db
        .prepare("select statusIndex from ParkingTicketStatusLog" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " and statusKey = 'convicted'")
        .get(ticketID);
    if (convictedStatusCheck) {
        return true;
    }
    return false;
};
exports.isParkingTicketConvicted = (ticketID) => {
    const db = sqlite(databasePaths_1.parkingDB, {
        readonly: true
    });
    const result = exports.isParkingTicketConvictedWithDB(db, ticketID);
    db.close();
    return result;
};
