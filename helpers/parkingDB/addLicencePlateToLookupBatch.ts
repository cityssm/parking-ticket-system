import * as sqlite from "better-sqlite3";

import type * as pts from "../ptsTypes";

import { dbPath } from "../parkingDB";


interface AddLicencePlateToLookupBatchReturn {
  success: boolean;
  message?: string;
  batch?: pts.LicencePlateLookupBatch;
}


export const addLicencePlateToLookupBatch =
  (reqBody: pts.LicencePlateLookupBatchEntry, reqSession: Express.Session): AddLicencePlateToLookupBatchReturn => {

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

    const info = db.prepare("insert or ignore into LicencePlateLookupBatchEntries" +
      " (batchID, licencePlateCountry, licencePlateProvince, licencePlateNumber, ticketID)" +
      " values (?, ?, ?, ?, ?)")
      .run(reqBody.batchID,
        reqBody.licencePlateCountry, reqBody.licencePlateProvince, reqBody.licencePlateNumber,
        reqBody.ticketID);

    db.close();

    if (info.changes > 0) {

      return {
        success: true
      };

    } else {

      return {
        success: false,
        message: "Licence plate not added to the batch.  It may be already part of the batch."
      };

    }

  };
