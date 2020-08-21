"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unresolveParkingTicket = void 0;
const sqlite = require("better-sqlite3");
const configFns = require("../configFns");
const databasePaths_1 = require("../../data/databasePaths");
exports.unresolveParkingTicket = (ticketID, reqSession) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const ticketObj = db.prepare("select recordUpdate_timeMillis from ParkingTickets" +
        " where ticketID = ?" +
        " and recordDelete_timeMillis is null" +
        " and resolvedDate is not null")
        .get(ticketID);
    if (!ticketObj) {
        db.close();
        return {
            success: false,
            message: "The ticket has either been deleted, or is no longer marked as resolved."
        };
    }
    else if (ticketObj.recordUpdate_timeMillis + configFns.getProperty("user.createUpdateWindowMillis") < Date.now()) {
        db.close();
        return {
            success: false,
            message: "The ticket is outside of the window for removing the resolved status."
        };
    }
    const info = db.prepare("update ParkingTickets" +
        " set resolvedDate = null," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where ticketID = ?" +
        " and resolvedDate is not null" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, Date.now(), ticketID);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
