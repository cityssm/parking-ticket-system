import sqlite from "better-sqlite3";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { parkingDB as databasePath } from "../../data/databasePaths.js";
export const createLookupBatch = (requestBody, requestSession) => {
    const database = sqlite(databasePath);
    const rightNow = new Date();
    const info = database.prepare("insert into LicencePlateLookupBatches" +
        " (batchDate, mto_includeLabels, recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?)")
        .run(dateTimeFns.dateToInteger(rightNow), (requestBody.mto_includeLabels && requestBody.mto_includeLabels === "1"
        ? 1
        : 0), requestSession.user.userName, rightNow.getTime(), requestSession.user.userName, rightNow.getTime());
    database.close();
    return info.changes > 0
        ? {
            success: true,
            batch: {
                recordType: "batch",
                batchID: info.lastInsertRowid,
                batchDate: dateTimeFns.dateToInteger(rightNow),
                batchDateString: dateTimeFns.dateToString(rightNow),
                lockDate: undefined,
                lockDateString: "",
                batchEntries: []
            }
        }
        : { success: false };
};
export default createLookupBatch;
