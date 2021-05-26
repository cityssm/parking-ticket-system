import sqlite from "better-sqlite3";
import { isConvictionBatchUpdatableWithDB } from "./isConvictionBatchUpdatable.js";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const clearConvictionBatch = (batchID, reqSession) => {
    const db = sqlite(dbPath);
    const batchIsAvailable = isConvictionBatchUpdatableWithDB(db, batchID);
    if (!batchIsAvailable) {
        db.close();
        return {
            success: false,
            message: "The batch cannot be updated."
        };
    }
    const rightNowMillis = Date.now();
    const info = db
        .prepare("update ParkingTicketStatusLog" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where recordDelete_timeMillis is null" +
        " and statusKey in ('convicted', 'convictionBatch')" +
        " and statusField = ?")
        .run(reqSession.user.userName, rightNowMillis, batchID.toString());
    db.close();
    return {
        success: info.changes > 0
    };
};
export default clearConvictionBatch;
