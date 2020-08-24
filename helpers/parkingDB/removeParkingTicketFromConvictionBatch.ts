import * as sqlite from "better-sqlite3";

import { isConvictionBatchUpdatable } from "./isConvictionBatchUpdatable";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const removeParkingTicketFromConvictionBatch = (
  batchID: number,
  ticketID: number,
  reqSession: Express.Session
) => {

  const db = sqlite(dbPath);

  // Ensure batch is not locked

  const batchIsAvailable = isConvictionBatchUpdatable(db, batchID);

  if (!batchIsAvailable) {
    db.close();

    return {
      success: false,
      message: "The batch cannot be updated."
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
