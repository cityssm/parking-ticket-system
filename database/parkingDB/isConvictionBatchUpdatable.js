import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export function isConvictionBatchUpdatable(batchID, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(databasePath);
    const lockDate = database
        .prepare(`select lockDate
        from ParkingTicketConvictionBatches
        where recordDelete_timeMillis is null
        and batchID = ?`)
        .pluck()
        .get(batchID);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return (lockDate ?? undefined) === undefined;
}
export default isConvictionBatchUpdatable;
