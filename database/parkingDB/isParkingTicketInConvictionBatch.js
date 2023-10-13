import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export const isParkingTicketInConvictionBatchWithDB = (database, ticketID) => {
    const batchStatusCheck = database
        .prepare(`select statusField
        from ParkingTicketStatusLog
        where recordDelete_timeMillis is null
        and ticketID = ?
        and statusKey = 'convictionBatch'`)
        .get(ticketID);
    if (batchStatusCheck !== undefined) {
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
    const database = sqlite(databasePath, {
        readonly: true
    });
    const result = isParkingTicketInConvictionBatchWithDB(database, ticketID);
    database.close();
    return result;
};
export default isParkingTicketInConvictionBatch;
