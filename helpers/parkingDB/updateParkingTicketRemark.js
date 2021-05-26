import sqlite from "better-sqlite3";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const updateParkingTicketRemark = (reqBody, reqSession) => {
    const db = sqlite(dbPath);
    const info = db.prepare("update ParkingTicketRemarks" +
        " set remarkDate = ?," +
        " remarkTime = ?," +
        " remark = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where ticketID = ?" +
        " and remarkIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(dateTimeFns.dateStringToInteger(reqBody.remarkDateString), dateTimeFns.timeStringToInteger(reqBody.remarkTimeString), reqBody.remark, reqSession.user.userName, Date.now(), reqBody.ticketID, reqBody.remarkIndex);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
export default updateParkingTicketRemark;
