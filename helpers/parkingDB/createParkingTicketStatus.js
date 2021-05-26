import sqlite from "better-sqlite3";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import getNextParkingTicketStatusIndex from "./getNextParkingTicketStatusIndex.js";
import { resolveParkingTicketWithDB } from "./resolveParkingTicket.js";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const createParkingTicketStatusWithDB = (db, reqBodyOrObj, reqSession, resolveTicket) => {
    const statusIndexNew = getNextParkingTicketStatusIndex(db, reqBodyOrObj.ticketID);
    const rightNow = new Date();
    const info = db.prepare("insert into ParkingTicketStatusLog" +
        " (ticketID, statusIndex, statusDate, statusTime, statusKey," +
        " statusField, statusField2, statusNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBodyOrObj.ticketID, statusIndexNew, dateTimeFns.dateToInteger(rightNow), dateTimeFns.dateToTimeInteger(rightNow), reqBodyOrObj.statusKey, reqBodyOrObj.statusField, reqBodyOrObj.statusField2, reqBodyOrObj.statusNote, reqSession.user.userName, rightNow.getTime(), reqSession.user.userName, rightNow.getTime());
    if (info.changes > 0 && resolveTicket) {
        resolveParkingTicketWithDB(db, reqBodyOrObj.ticketID, reqSession);
    }
    return {
        success: (info.changes > 0),
        statusIndex: statusIndexNew
    };
};
export const createParkingTicketStatus = (reqBodyOrObj, reqSession, resolveTicket) => {
    const db = sqlite(dbPath);
    const result = createParkingTicketStatusWithDB(db, reqBodyOrObj, reqSession, resolveTicket);
    db.close();
    return result;
};
export default createParkingTicketStatus;
