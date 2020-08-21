import * as sqlite from "better-sqlite3";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const removeParkingTicketFromConvictionBatch = (
  batchID: number,
  ticketID: number,
  reqSession: Express.Session
) => {
  const db = sqlite(dbPath);

  // Ensure batch is not locked

  const lockedBatchCheck = db
    .prepare(
      "select lockDate from ParkingTicketConvictionBatches" +
      " where recordDelete_timeMillis is null" +
      " and batchID = ?"
    )
    .get(batchID);

  if (!lockedBatchCheck) {
    db.close();

    return {
      success: false,
      message: "The batch is unavailable."
    };
  } else if (lockedBatchCheck.lockDate) {
    db.close();

    return {
      success: false,
      message: "The batch is locked and cannot be updated."
    };
  }

  // Update statuses

  const rightNowMillis = Date.now();

  const info = db
    .prepare(
      "update ParkingTicketStatusLog" +
      " set recordDelete_userName = ?," +
      " recordDelete_timeMillis = ?" +
      " where recordDelete_timeMillis is null" +
      " and ticketID = ?" +
      " and statusKey in ('convicted', 'convictionBatch')" +
      " and statusField = ?"
    )
    .run(
      reqSession.user.userName,
      rightNowMillis,
      ticketID,
      batchID.toString()
    );

  db.close();

  return {
    success: info.changes > 0
  };
};
