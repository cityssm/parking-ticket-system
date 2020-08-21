import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import type * as pts from "../ptsTypes";

import { parkingDB as dbPath } from "../../data/databasePaths";


export interface LookupBatchReturn {
  success: boolean;
  message?: string;
  batch?: pts.LicencePlateLookupBatch;
}


export const getLookupBatch = (batchID_or_negOne: number) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const baseBatchSQL = "select batchID, batchDate, lockDate, sentDate, receivedDate," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
    " from LicencePlateLookupBatches" +
    " where recordDelete_timeMillis is null";

  let batch: pts.LicencePlateLookupBatch;

  if (batchID_or_negOne === -1) {

    batch = db.prepare(baseBatchSQL +
      " and lockDate is null" +
      " order by batchID desc" +
      " limit 1")
      .get();

  } else {

    batch = db.prepare(baseBatchSQL +
      " and batchID = ?")
      .get(batchID_or_negOne);
  }

  if (!batch) {
    db.close();
    return null;
  }

  batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate);
  batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate);
  batch.sentDateString = dateTimeFns.dateIntegerToString(batch.sentDate);
  batch.receivedDateString = dateTimeFns.dateIntegerToString(batch.receivedDate);

  batch.batchEntries = db.prepare("select e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber," +
    " e.ticketID, t.ticketNumber, t.issueDate" +
    " from LicencePlateLookupBatchEntries e" +
    " left join ParkingTickets t on e.ticketID = t.ticketID" +
    " where e.batchID = ?" +
    " order by e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber")
    .all(batch.batchID);

  db.close();

  return batch;
};
