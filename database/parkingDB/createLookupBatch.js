import * as dateTimeFns from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export const createLookupBatch = (requestBody, sessionUser) => {
    const database = sqlite(databasePath);
    const rightNow = new Date();
    const info = database
        .prepare(`insert into LicencePlateLookupBatches (
        batchDate, mto_includeLabels,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?)`)
        .run(dateTimeFns.dateToInteger(rightNow), (requestBody.mto_includeLabels ?? '0') === '1' ? 1 : 0, sessionUser.userName, rightNow.getTime(), sessionUser.userName, rightNow.getTime());
    database.close();
    return info.changes > 0
        ? {
            success: true,
            batch: {
                recordType: 'batch',
                batchID: info.lastInsertRowid,
                batchDate: dateTimeFns.dateToInteger(rightNow),
                batchDateString: dateTimeFns.dateToString(rightNow),
                lockDate: undefined,
                lockDateString: '',
                batchEntries: []
            }
        }
        : { success: false };
};
export default createLookupBatch;
