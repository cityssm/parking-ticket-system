import type * as sqlite from "better-sqlite3";


export const isConvictionBatchUpdatable = (db: sqlite.Database, batchID: number) => {

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
