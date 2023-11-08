import { dateIntegerToString, dateToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export function lockConvictionBatch(batchId, sessionUser) {
    const database = sqlite(databasePath);
    const rightNow = new Date();
    const lockDate = dateToInteger(rightNow);
    const info = database
        .prepare(`update ParkingTicketConvictionBatches
        set lockDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and batchId = ?
        and lockDate is null`)
        .run(lockDate, sessionUser.userName, rightNow.getTime(), batchId);
    database.close();
    return {
        success: info.changes > 0,
        lockDate,
        lockDateString: dateIntegerToString(lockDate)
    };
}
export default lockConvictionBatch;
