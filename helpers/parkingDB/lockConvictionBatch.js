import sqlite from "better-sqlite3";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const lockConvictionBatch = (batchID, reqSession) => {
    const db = sqlite(dbPath);
    const rightNow = new Date();
    const lockDate = dateTimeFns.dateToInteger(rightNow);
    const info = db
        .prepare("update ParkingTicketConvictionBatches" +
        " set lockDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where recordDelete_timeMillis is null" +
        " and batchID = ?" +
        " and lockDate is null")
        .run(lockDate, reqSession.user.userName, rightNow.getTime(), batchID);
    db.close();
    return {
        success: info.changes > 0,
        lockDate,
        lockDateString: dateTimeFns.dateIntegerToString(lockDate)
    };
};
export default lockConvictionBatch;
