"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupParkingTicketsTable = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.cleanupParkingTicketsTable = (recordDelete_timeMillis) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const recordsToDelete = db.prepare("select ticketID from ParkingTickets t" +
        " where t.recordDelete_timeMillis is not null" +
        " and t.recordDelete_timeMillis < ?" +
        (" and not exists (" +
            "select 1 from LicencePlateLookupBatchEntries b" +
            " where t.ticketID = b.ticketID)"))
        .all(recordDelete_timeMillis);
    for (const recordToDelete of recordsToDelete) {
        db.prepare("delete from ParkingTicketRemarks" +
            " where ticketID = ?")
            .run(recordToDelete.ticketID);
        db.prepare("delete from ParkingTicketStatusLog" +
            " where ticketID = ?")
            .run(recordToDelete.ticketID);
        db.prepare("delete from ParkingTickets" +
            " where ticketID = ?")
            .run(recordToDelete.ticketID);
    }
    db.close();
    return true;
};
