import sqlite from "better-sqlite3";
import { parkingDB as databasePath } from "../../data/databasePaths.js";
export const isConvictionBatchUpdatableWithDB = (database, batchID) => {
    const check = database
        .prepare("select lockDate from ParkingTicketConvictionBatches" +
        " where recordDelete_timeMillis is null" +
        " and batchID = ?")
        .get(batchID);
    if (!check || check.lockDate) {
        return false;
    }
    return true;
};
export const isConvictionBatchUpdatable = (ticketID) => {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const result = isConvictionBatchUpdatableWithDB(database, ticketID);
    database.close();
    return result;
};
export default isConvictionBatchUpdatable;
