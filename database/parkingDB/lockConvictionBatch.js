import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export const lockConvictionBatch = (batchID, requestSession) => {
    const database = sqlite(databasePath);
    const rightNow = new Date();
    const lockDate = dateTimeFns.dateToInteger(rightNow);
    const info = database
        .prepare(`update ParkingTicketConvictionBatches
        set lockDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and batchID = ?
        and lockDate is null`)
        .run(lockDate, requestSession.user.userName, rightNow.getTime(), batchID);
    database.close();
    return {
        success: info.changes > 0,
        lockDate,
        lockDateString: dateTimeFns.dateIntegerToString(lockDate)
    };
};
export default lockConvictionBatch;
