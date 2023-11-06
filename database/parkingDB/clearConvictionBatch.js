import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { isConvictionBatchUpdatable } from './isConvictionBatchUpdatable.js';
export const clearConvictionBatch = (batchID, sessionUser) => {
    const database = sqlite(databasePath);
    const batchIsAvailable = isConvictionBatchUpdatable(batchID, database);
    if (!batchIsAvailable) {
        database.close();
        return {
            success: false,
            message: 'The batch cannot be updated.'
        };
    }
    const rightNowMillis = Date.now();
    const info = database
        .prepare(`update ParkingTicketStatusLog
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and statusKey in ('convicted', 'convictionBatch')
        and statusField = ?`)
        .run(sessionUser.userName, rightNowMillis, batchID.toString());
    database.close();
    return {
        success: info.changes > 0
    };
};
export default clearConvictionBatch;
