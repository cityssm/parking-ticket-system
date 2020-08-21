"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParkingTicketID = void 0;
const sqlite = require("better-sqlite3");
const parkingDB_1 = require("../parkingDB");
exports.getParkingTicketID = (ticketNumber) => {
    const db = sqlite(parkingDB_1.dbPath, {
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
