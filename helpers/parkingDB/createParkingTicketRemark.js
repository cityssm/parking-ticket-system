import sqlite from "better-sqlite3";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { getNextParkingTicketRemarkIndex } from "./getNextParkingTicketRemarkIndex.js";
import { parkingDB as databasePath } from "../../data/databasePaths.js";
export const createParkingTicketRemark = (requestBody, requestSession) => {
    const database = sqlite(databasePath);
    const remarkIndexNew = getNextParkingTicketRemarkIndex(database, requestBody.ticketID);
    const rightNow = new Date();
    const info = database.prepare("insert into ParkingTicketRemarks" +
        " (ticketID, remarkIndex, remarkDate, remarkTime, remark," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(requestBody.ticketID, remarkIndexNew, dateTimeFns.dateToInteger(rightNow), dateTimeFns.dateToTimeInteger(rightNow), requestBody.remark, requestSession.user.userName, rightNow.getTime(), requestSession.user.userName, rightNow.getTime());
    database.close();
    return {
        success: (info.changes > 0)
    };
};
export default createParkingTicketRemark;
