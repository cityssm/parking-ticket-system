import sqlite from "better-sqlite3";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { canUpdateObject } from "../parkingDB.js";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const getParkingTicketStatusesWithDB = (db, ticketID, reqSession) => {
    const statusRows = db.prepare("select * from ParkingTicketStatusLog" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " order by statusDate desc, statusTime desc, statusIndex desc")
        .all(ticketID);
    for (const status of statusRows) {
        status.recordType = "status";
        status.statusDateString = dateTimeFns.dateIntegerToString(status.statusDate);
        status.statusTimeString = dateTimeFns.timeIntegerToString(status.statusTime);
        status.canUpdate = canUpdateObject(status, reqSession);
    }
    return statusRows;
};
export const getParkingTicketStatuses = (ticketID, reqSession) => {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const statusRows = getParkingTicketStatusesWithDB(db, ticketID, reqSession);
    db.close();
    return statusRows;
};
export default getParkingTicketStatuses;
