"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConvictionBatch = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const parkingDB_1 = require("../parkingDB");
exports.createConvictionBatch = (reqSession) => {
    const db = sqlite(parkingDB_1.dbPath);
    const rightNow = new Date();
    const info = db
        .prepare("insert into ParkingTicketConvictionBatches" +
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
