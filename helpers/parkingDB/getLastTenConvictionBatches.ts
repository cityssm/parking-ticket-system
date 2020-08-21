import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import type * as pts from "../ptsTypes";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const getLastTenConvictionBatches = () => {
  const db = sqlite(dbPath, {
    readonly: true
  });

  const batches: pts.ParkingTicketConvictionBatch[] = db
    .prepare(
      "select batchID, batchDate, lockDate, sentDate," +
      " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
      " from ParkingTicketConvictionBatches" +
      " where recordDelete_timeMillis is null" +
      " order by batchID desc" +
      " limit 10"
    )
    .all();

  db.close();

  for (const batch of batches) {
    batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate);
    batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate);
    batch.sentDateString = dateTimeFns.dateIntegerToString(batch.sentDate);
  }

  return batches;
};
