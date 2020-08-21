"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acknowledgeLookupErrorLogEntry = void 0;
const sqlite = require("better-sqlite3");
const parkingDB_1 = require("../parkingDB");
exports.acknowledgeLookupErrorLogEntry = (batchID, logIndex, reqSession) => {
    const db = sqlite(parkingDB_1.dbPath);
    const info = db.prepare("update LicencePlateLookupErrorLog" +
        " set isAcknowledged = 1," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where recordDelete_timeMillis is null" +
        " and batchID = ?" +
        " and logIndex = ?" +
        " and isAcknowledged = 0")
        .run(reqSession.user.userName, Date.now(), batchID, logIndex);
    db.close();
    return info.changes > 0;
};
