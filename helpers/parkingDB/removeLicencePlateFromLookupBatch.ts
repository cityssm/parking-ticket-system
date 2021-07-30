import sqlite from "better-sqlite3";

import type * as pts from "../../types/recordTypes";

import { parkingDB as databasePath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


export const removeLicencePlateFromLookupBatch =
  (requestBody: pts.LicencePlateLookupBatchEntry, requestSession: expressSession.Session): { success: boolean; message?: string } => {

    const database = sqlite(databasePath);

    // Ensure batch is not locked

    const canUpdateBatch = database.prepare("update LicencePlateLookupBatches" +
      " set recordUpdate_userName = ?," +
      " recordUpdate_timeMillis = ?" +
      " where batchID = ?" +
      " and recordDelete_timeMillis is null" +
      " and lockDate is null")
      .run(requestSession.user.userName,
        Date.now(),
        requestBody.batchID).changes;

    if (canUpdateBatch === 0) {

      database.close();

      return {
        success: false,
        message: "Batch cannot be updated."
      };

    }

    const info = database.prepare("delete from LicencePlateLookupBatchEntries" +
      " where batchID = ?" +
      " and licencePlateCountry = ?" +
      " and licencePlateProvince = ?" +
      " and licencePlateNumber = ?")
      .run(requestBody.batchID,
        requestBody.licencePlateCountry, requestBody.licencePlateProvince, requestBody.licencePlateNumber);

    database.close();

    return info.changes > 0
      ? {
        success: true
      }
      : {
        success: false,
        message: "Licence plate not removed from the batch."
      };

  };


export default removeLicencePlateFromLookupBatch;
