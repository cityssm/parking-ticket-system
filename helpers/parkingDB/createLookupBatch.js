"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLookupBatch = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const databasePaths_1 = require("../../data/databasePaths");
exports.createLookupBatch = (reqSession) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const rightNow = new Date();
    const info = db.prepare("insert into LicencePlateLookupBatches" +
        " (batchDate, recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?)")
        .run(dateTimeFns.dateToInteger(rightNow), reqSession.user.userName, rightNow.getTime(), reqSession.user.userName, rightNow.getTime());
    db.close();
    if (info.changes > 0) {
        return {
            success: true,
            batch: {
                batchID: info.lastInsertRowid,
                batchDate: dateTimeFns.dateToInteger(rightNow),
                batchDateString: dateTimeFns.dateToString(rightNow),
                lockDate: null,
                lockDateString: "",
                batchEntries: []
            }
        };
    }
    else {
        return { success: false };
    }
};
