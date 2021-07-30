import sqlite from "better-sqlite3";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { canUpdateObject } from "../parkingDB.js";
import { parkingDB as databasePath } from "../../data/databasePaths.js";
export const getParkingTicketRemarksWithDB = (database, ticketID, requestSession) => {
    const remarkRows = database.prepare("select * from ParkingTicketRemarks" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " order by remarkDate desc, remarkTime desc, remarkIndex desc")
        .all(ticketID);
    for (const remark of remarkRows) {
        remark.recordType = "remark";
        remark.remarkDateString = dateTimeFns.dateIntegerToString(remark.remarkDate);
        remark.remarkTimeString = dateTimeFns.timeIntegerToString(remark.remarkTime);
        remark.canUpdate = canUpdateObject(remark, requestSession);
    }
    return remarkRows;
};
export const getParkingTicketRemarks = (ticketID, requestSession) => {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const remarkRows = getParkingTicketRemarksWithDB(database, ticketID, requestSession);
    return remarkRows;
};
export default getParkingTicketRemarks;
