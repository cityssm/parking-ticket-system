import sqlite from "better-sqlite3";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const markConvictionBatchAsSent = (batchID, reqSession) => {
    const db = sqlite(dbPath);
    const rightNow = new Date();
    const info = db
        .prepare("update ParkingTicketConvictionBatches" +
        " set sentDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where batchID = ?" +
        " and recordDelete_timeMillis is null" +
        " and lockDate is not null" +
        " and sentDate is null")
        .run(dateTimeFns.dateToInteger(rightNow), reqSession.user.userName, rightNow.getTime(), batchID);
    db.prepare("update ParkingTickets" +
        " set resolvedDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where resolvedDate is null" +
        (" and exists (" +
            "select 1 from ParkingTicketStatusLog s" +
            " where ParkingTickets.ticketID = s.ticketID" +
            " and s.recordDelete_timeMillis is null" +
            " and s.statusField = ?" +
            ")")).run(dateTimeFns.dateToInteger(rightNow), reqSession.user.userName, rightNow.getTime(), batchID.toString());
    db.close();
    return info.changes > 0;
};
export default markConvictionBatchAsSent;
