import * as sqlite from "better-sqlite3";

import { getLookupBatch } from "./getLookupBatch";

import { dbPath } from "../parkingDB";


interface AddAllLicencePlatesToLookupBatchBody {
  batchID: number;
  licencePlateCountry: string;
  licencePlateProvince: string;
  licencePlateNumbers: Array<[string, number]>;
}


export const addAllLicencePlatesToLookupBatch =
  (reqBody: AddAllLicencePlatesToLookupBatchBody, reqSession: Express.Session) => {

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

    const insertStmt = db.prepare("insert or ignore into LicencePlateLookupBatchEntries" +
      " (batchID, licencePlateCountry, licencePlateProvince, licencePlateNumber, ticketID)" +
      " values (?, ?, ?, ?, ?)");

    let changeCount = 0;

    for (const licencePlateNumberRecord of reqBody.licencePlateNumbers) {

      const info = insertStmt
        .run(reqBody.batchID,
          reqBody.licencePlateCountry, reqBody.licencePlateProvince, licencePlateNumberRecord[0],
          licencePlateNumberRecord[1]);

      changeCount += info.changes;
    }

    db.close();

    if (changeCount > 0) {

      return {
        success: true,
        batch: getLookupBatch(reqBody.batchID)
      };

    } else {

      return {
        success: false,
        message: "Licence plate not added to the batch.  It may be already part of the batch."
      };

    }

  };
