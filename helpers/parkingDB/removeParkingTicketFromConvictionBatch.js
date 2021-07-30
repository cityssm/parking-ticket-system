import sqlite from "better-sqlite3";
import { isConvictionBatchUpdatableWithDB } from "./isConvictionBatchUpdatable.js";
import { parkingDB as databasePath } from "../../data/databasePaths.js";
export const removeParkingTicketFromConvictionBatch = (batchID, ticketID, requestSession) => {
    const database = sqlite(databasePath);
    const batchIsAvailable = isConvictionBatchUpdatableWithDB(database, batchID);
    if (!batchIsAvailable) {
        database.close();
        return {
            success: false,
            message: "The batch cannot be updated."
        };
    }
    const rightNowMillis = Date.now();
    const info = database
        .prepare("update ParkingTicketStatusLog" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " and statusKey in ('convicted', 'convictionBatch')" +
        " and statusField = ?")
        .run(requestSession.user.userName, rightNowMillis, ticketID, batchID.toString());
    database.close();
    return {
        success: info.changes > 0
    };
};
export default removeParkingTicketFromConvictionBatch;
