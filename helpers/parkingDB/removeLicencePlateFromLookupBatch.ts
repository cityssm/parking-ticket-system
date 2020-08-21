import * as sqlite from "better-sqlite3";

import type * as pts from "../ptsTypes";

import { dbPath } from "../parkingDB";


export const removeLicencePlateFromLookupBatch =
  (reqBody: pts.LicencePlateLookupBatchEntry, reqSession: Express.Session) => {

    const db = sqlite(dbPath);

    // Ensure batch is not locked

    const canUpdateBatch = db.prepare("update LicencePlateLookupBatches" +
      " set recordUpdate_userName = ?," +
      " recordUpdate_timeMillis = ?" +
      " where batchID = ?" +
      " and recordDelete_timeMillis is null" +
      " and lockDate is null")
      .run(reqSession.user.userName,
        Date.now(),
        reqBody.batchID).changes;

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
      .run(reqBody.batchID,
        reqBody.licencePlateCountry, reqBody.licencePlateProvince, reqBody.licencePlateNumber);

    db.close();

    if (info.changes > 0) {

      return {
        success: true
      };

    } else {

      return {
        success: false,
        message: "Licence plate not removed from the batch."
      };

    }

  };
