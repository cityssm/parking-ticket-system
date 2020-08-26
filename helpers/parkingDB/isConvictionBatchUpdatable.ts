import * as sqlite from "better-sqlite3";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const isConvictionBatchUpdatableWithDB = (db: sqlite.Database, batchID: number) => {

  const check = db
    .prepare(
      "select lockDate from ParkingTicketConvictionBatches" +
      " where recordDelete_timeMillis is null" +
      " and batchID = ?"
    )
    .get(batchID);

  if (!check || check.lockDate) {
    return false;
  }

  return true;
};


export const isConvictionBatchUpdatable = (ticketID: number) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const result = isConvictionBatchUpdatableWithDB(db, ticketID);

  db.close();

  return result;
};
