"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createParkingTicketStatus = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const getNextParkingTicketStatusIndex_1 = require("./getNextParkingTicketStatusIndex");
const databasePaths_1 = require("../../data/databasePaths");
exports.createParkingTicketStatus = (reqBodyOrObj, reqSession, resolveTicket) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const statusIndexNew = getNextParkingTicketStatusIndex_1.getNextParkingTicketStatusIndex(db, reqBodyOrObj.ticketID);
    const rightNow = new Date();
    const info = db.prepare("insert into ParkingTicketStatusLog" +
        " (ticketID, statusIndex, statusDate, statusTime, statusKey," +
        " statusField, statusField2, statusNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBodyOrObj.ticketID, statusIndexNew, dateTimeFns.dateToInteger(rightNow), dateTimeFns.dateToTimeInteger(rightNow), reqBodyOrObj.statusKey, reqBodyOrObj.statusField, reqBodyOrObj.statusField2, reqBodyOrObj.statusNote, reqSession.user.userName, rightNow.getTime(), reqSession.user.userName, rightNow.getTime());
    if (info.changes > 0 && resolveTicket) {
        db.prepare("update ParkingTickets" +
            " set resolvedDate = ?," +
            " recordUpdate_userName = ?," +
            " recordUpdate_timeMillis = ?" +
            " where ticketID = ?" +
            " and resolvedDate is null" +
            " and recordDelete_timeMillis is null")
            .run(dateTimeFns.dateToInteger(rightNow), reqSession.user.userName, rightNow.getTime(), reqBodyOrObj.ticketID);
    }
    db.close();
    return {
        success: (info.changes > 0),
        statusIndex: statusIndexNew
    };
};
