import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import type * as pts from "../../types/recordTypes";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const getUnreceivedLookupBatches = (includeUnlocked: boolean) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const batches: pts.LicencePlateLookupBatch[] = db.prepare(
    "select b.batchID, b.batchDate, b.lockDate, b.sentDate, count(e.batchID) as batchEntryCount" +
    " from LicencePlateLookupBatches b" +
    " left join LicencePlateLookupBatchEntries e on b.batchID = e.batchID" +
    " where b.recordDelete_timeMillis is null" +
    " and b.receivedDate is null" +
    (includeUnlocked ? "" : " and b.lockDate is not null") +
    " group by b.batchID, b.batchDate, b.lockDate, b.sentDate" +
    " order by b.batchID desc")
    .all();

  db.close();

  for (const batch of batches) {
    batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate);
    batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate);
    batch.sentDateString = dateTimeFns.dateIntegerToString(batch.sentDate);
  }

  return batches;
};
