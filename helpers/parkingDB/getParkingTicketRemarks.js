import sqlite from "better-sqlite3";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { canUpdateObject } from "../parkingDB.js";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const getParkingTicketRemarksWithDB = (db, ticketID, reqSession) => {
    const remarkRows = db.prepare("select * from ParkingTicketRemarks" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " order by remarkDate desc, remarkTime desc, remarkIndex desc")
        .all(ticketID);
    for (const remark of remarkRows) {
        remark.recordType = "remark";
        remark.remarkDateString = dateTimeFns.dateIntegerToString(remark.remarkDate);
        remark.remarkTimeString = dateTimeFns.timeIntegerToString(remark.remarkTime);
        remark.canUpdate = canUpdateObject(remark, reqSession);
    }
    return remarkRows;
};
export const getParkingTicketRemarks = (ticketID, reqSession) => {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const remarkRows = getParkingTicketRemarksWithDB(db, ticketID, reqSession);
    return remarkRows;
};
export default getParkingTicketRemarks;
