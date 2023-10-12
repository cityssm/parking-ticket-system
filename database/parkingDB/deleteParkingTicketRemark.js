import sqlite from "better-sqlite3";
import { parkingDB as databasePath } from "../../data/databasePaths.js";
export const deleteParkingTicketRemark = (ticketID, remarkIndex, requestSession) => {
    const database = sqlite(databasePath);
    const info = database.prepare("update ParkingTicketRemarks" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where ticketID = ?" +
        " and remarkIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(requestSession.user.userName, Date.now(), ticketID, remarkIndex);
    database.close();
    return {
        success: (info.changes > 0)
    };
};
export default deleteParkingTicketRemark;
