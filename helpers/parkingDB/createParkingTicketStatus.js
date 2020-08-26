"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createParkingTicketStatus = exports.createParkingTicketStatusWithDB = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const getNextParkingTicketStatusIndex_1 = require("./getNextParkingTicketStatusIndex");
const resolveParkingTicket_1 = require("./resolveParkingTicket");
const databasePaths_1 = require("../../data/databasePaths");
exports.createParkingTicketStatusWithDB = (db, reqBodyOrObj, reqSession, resolveTicket) => {
    const statusIndexNew = getNextParkingTicketStatusIndex_1.getNextParkingTicketStatusIndex(db, reqBodyOrObj.ticketID);
    const rightNow = new Date();
    const info = db.prepare("insert into ParkingTicketStatusLog" +
        " (ticketID, statusIndex, statusDate, statusTime, statusKey," +
        " statusField, statusField2, statusNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBodyOrObj.ticketID, statusIndexNew, dateTimeFns.dateToInteger(rightNow), dateTimeFns.dateToTimeInteger(rightNow), reqBodyOrObj.statusKey, reqBodyOrObj.statusField, reqBodyOrObj.statusField2, reqBodyOrObj.statusNote, reqSession.user.userName, rightNow.getTime(), reqSession.user.userName, rightNow.getTime());
    if (info.changes > 0 && resolveTicket) {
        resolveParkingTicket_1.resolveParkingTicketWithDB(db, reqBodyOrObj.ticketID, reqSession);
    }
    return {
        success: (info.changes > 0),
        statusIndex: statusIndexNew
    };
};
exports.createParkingTicketStatus = (reqBodyOrObj, reqSession, resolveTicket) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const result = exports.createParkingTicketStatusWithDB(db, reqBodyOrObj, reqSession, resolveTicket);
    db.close();
    return result;
};
