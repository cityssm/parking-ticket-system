"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearLookupBatch = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.clearLookupBatch = (batchID, reqSession) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const canUpdateBatch = db.prepare("update LicencePlateLookupBatches" +
        " set recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where batchID = ?" +
        " and recordDelete_timeMillis is null" +
        " and lockDate is null")
        .run(reqSession.user.userName, Date.now(), batchID).changes;
    if (canUpdateBatch === 0) {
        db.close();
        return {
            success: false,
            message: "Batch cannot be updated."
        };
    }
    db.prepare("delete from LicencePlateLookupBatchEntries" +
        " where batchID = ?")
        .run(batchID);
    db.close();
    return {
        success: true
    };
};
