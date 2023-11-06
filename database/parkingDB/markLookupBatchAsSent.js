import * as dateTimeFns from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export const markLookupBatchAsSent = (batchID, sessionUser) => {
    const database = sqlite(databasePath);
    const rightNow = new Date();
    const info = database
        .prepare(`update LicencePlateLookupBatches
        set sentDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where batchID = ?
        and recordDelete_timeMillis is null
        and lockDate is not null
        and sentDate is null`)
        .run(dateTimeFns.dateToInteger(rightNow), sessionUser.userName, rightNow.getTime(), batchID);
    database.close();
    return info.changes > 0;
};
export default markLookupBatchAsSent;
