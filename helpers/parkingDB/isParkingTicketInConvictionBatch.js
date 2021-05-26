import sqlite from "better-sqlite3";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const isParkingTicketInConvictionBatchWithDB = (db, ticketID) => {
    const batchStatusCheck = db
        .prepare("select statusField from ParkingTicketStatusLog" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " and statusKey = 'convictionBatch'")
        .get(ticketID);
    if (batchStatusCheck) {
        return {
            inBatch: true,
            batchIDString: batchStatusCheck.statusField
        };
    }
    return {
        inBatch: false
    };
};
export const isParkingTicketInConvictionBatch = (ticketID) => {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const result = isParkingTicketInConvictionBatchWithDB(db, ticketID);
    db.close();
    return result;
};
export default isParkingTicketInConvictionBatch;
