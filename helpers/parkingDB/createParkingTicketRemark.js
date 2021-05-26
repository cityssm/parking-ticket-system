import sqlite from "better-sqlite3";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import getNextParkingTicketRemarkIndex from "./getNextParkingTicketRemarkIndex.js";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const createParkingTicketRemark = (reqBody, reqSession) => {
    const db = sqlite(dbPath);
    const remarkIndexNew = getNextParkingTicketRemarkIndex(db, reqBody.ticketID);
    const rightNow = new Date();
    const info = db.prepare("insert into ParkingTicketRemarks" +
        " (ticketID, remarkIndex, remarkDate, remarkTime, remark," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.ticketID, remarkIndexNew, dateTimeFns.dateToInteger(rightNow), dateTimeFns.dateToTimeInteger(rightNow), reqBody.remark, reqSession.user.userName, rightNow.getTime(), reqSession.user.userName, rightNow.getTime());
    db.close();
    return {
        success: (info.changes > 0)
    };
};
export default createParkingTicketRemark;
