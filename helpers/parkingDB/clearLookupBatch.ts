import sqlite from "better-sqlite3";

import type { LookupBatchReturn } from "./getLookupBatch.js";

import { parkingDB as dbPath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


export const clearLookupBatch = (batchID: number, reqSession: expressSession.Session): LookupBatchReturn => {

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
      batchID).changes;

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


export default clearLookupBatch;
