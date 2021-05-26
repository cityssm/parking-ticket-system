import sqlite from "better-sqlite3";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const updateParkingTicketStatus = (reqBody, reqSession) => {
    const db = sqlite(dbPath);
    const info = db.prepare("update ParkingTicketStatusLog" +
        " set statusDate = ?," +
        " statusTime = ?," +
        " statusKey = ?," +
        " statusField = ?," +
        " statusField2 = ?," +
        " statusNote = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where ticketID = ?" +
        " and statusIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(dateTimeFns.dateStringToInteger(reqBody.statusDateString), dateTimeFns.timeStringToInteger(reqBody.statusTimeString), reqBody.statusKey, reqBody.statusField, reqBody.statusField2, reqBody.statusNote, reqSession.user.userName, Date.now(), reqBody.ticketID, reqBody.statusIndex);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
export default updateParkingTicketStatus;
