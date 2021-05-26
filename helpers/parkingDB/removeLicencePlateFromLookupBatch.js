import sqlite from "better-sqlite3";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const removeLicencePlateFromLookupBatch = (reqBody, reqSession) => {
    const db = sqlite(dbPath);
    const canUpdateBatch = db.prepare("update LicencePlateLookupBatches" +
        " set recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where batchID = ?" +
        " and recordDelete_timeMillis is null" +
        " and lockDate is null")
        .run(reqSession.user.userName, Date.now(), reqBody.batchID).changes;
    if (canUpdateBatch === 0) {
        db.close();
        return {
            success: false,
            message: "Batch cannot be updated."
        };
    }
    const info = db.prepare("delete from LicencePlateLookupBatchEntries" +
        " where batchID = ?" +
        " and licencePlateCountry = ?" +
        " and licencePlateProvince = ?" +
        " and licencePlateNumber = ?")
        .run(reqBody.batchID, reqBody.licencePlateCountry, reqBody.licencePlateProvince, reqBody.licencePlateNumber);
    db.close();
    if (info.changes > 0) {
        return {
            success: true
        };
    }
    else {
        return {
            success: false,
            message: "Licence plate not removed from the batch."
        };
    }
};
export default removeLicencePlateFromLookupBatch;
