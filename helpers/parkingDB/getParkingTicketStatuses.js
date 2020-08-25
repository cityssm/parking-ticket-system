"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParkingTicketStatuses = exports.getParkingTicketStatusesWithDB = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const parkingDB_1 = require("../parkingDB");
const databasePaths_1 = require("../../data/databasePaths");
exports.getParkingTicketStatusesWithDB = (db, ticketID, reqSession) => {
    const statusRows = db.prepare("select * from ParkingTicketStatusLog" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " order by statusDate desc, statusTime desc, statusIndex desc")
        .all(ticketID);
    for (const status of statusRows) {
        status.recordType = "status";
        status.statusDateString = dateTimeFns.dateIntegerToString(status.statusDate);
        status.statusTimeString = dateTimeFns.timeIntegerToString(status.statusTime);
        status.canUpdate = parkingDB_1.canUpdateObject(status, reqSession);
    }
    return statusRows;
};
exports.getParkingTicketStatuses = (ticketID, reqSession) => {
    const db = sqlite(databasePaths_1.parkingDB, {
        readonly: true
    });
    const statusRows = exports.getParkingTicketStatusesWithDB(db, ticketID, reqSession);
    db.close();
    return statusRows;
};
