"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParkingTicketID = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.getParkingTicketID = (ticketNumber) => {
    const db = sqlite(databasePaths_1.parkingDB, {
        readonly: true
    });
    const ticketRow = db.prepare("select ticketID" +
        " from ParkingTickets" +
        " where ticketNumber = ?" +
        " and recordDelete_timeMillis is null" +
        " order by ticketID desc" +
        " limit 1")
        .get(ticketNumber);
    db.close();
    if (ticketRow) {
        return ticketRow.ticketID;
    }
    return null;
};
