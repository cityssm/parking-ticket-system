import sqlite from "better-sqlite3";

import { getLookupBatch } from "./getLookupBatch.js";
import type * as pts from "../../types/recordTypes";

import { parkingDB as databasePath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


interface AddLicencePlateToLookupBatchReturn {
  success: boolean;
  message?: string;
  batch?: pts.LicencePlateLookupBatch;
}


export const addLicencePlateToLookupBatch =
  (requestBody: pts.LicencePlateLookupBatchEntry, requestSession: expressSession.Session): AddLicencePlateToLookupBatchReturn => {

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

    const info = database.prepare("insert or ignore into LicencePlateLookupBatchEntries" +
      " (batchID, licencePlateCountry, licencePlateProvince, licencePlateNumber, ticketID)" +
      " values (?, ?, ?, ?, ?)")
      .run(requestBody.batchID,
        requestBody.licencePlateCountry, requestBody.licencePlateProvince, requestBody.licencePlateNumber,
        requestBody.ticketID);

    database.close();

    return info.changes > 0
      ? {
        success: true
      }
      : {
        success: false,
        message: "Licence plate not added to the batch.  It may be already part of the batch."
      };

  };


interface AddAllLicencePlatesToLookupBatchBody {
  batchID: number;
  licencePlateCountry: string;
  licencePlateProvince: string;
  licencePlateNumbers: Array<[string, number]>;
}


export const addAllLicencePlatesToLookupBatch =
  (requestBody: AddAllLicencePlatesToLookupBatchBody, requestSession: expressSession.Session): AddLicencePlateToLookupBatchReturn => {

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

    const insertStmt = database.prepare("insert or ignore into LicencePlateLookupBatchEntries" +
      " (batchID, licencePlateCountry, licencePlateProvince, licencePlateNumber, ticketID)" +
      " values (?, ?, ?, ?, ?)");

    let changeCount = 0;

    for (const licencePlateNumberRecord of requestBody.licencePlateNumbers) {

      const info = insertStmt
        .run(requestBody.batchID,
          requestBody.licencePlateCountry, requestBody.licencePlateProvince, licencePlateNumberRecord[0],
          licencePlateNumberRecord[1]);

      changeCount += info.changes;
    }

    database.close();

    return changeCount > 0
      ? {
        success: true,
        batch: getLookupBatch(requestBody.batchID)
      }
      : {
        success: false,
        message: "Licence plate not added to the batch.  It may be already part of the batch."
      };
  };


export default addLicencePlateToLookupBatch;
