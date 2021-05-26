import sqlite from "better-sqlite3";

import { parkingDB as dbPath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


export const unlockConvictionBatch = (
  batchID: number,
  reqSession: expressSession.Session
) => {
  const db = sqlite(dbPath);

  const rightNowMillis = Date.now();

  const info = db
    .prepare(
      "update ParkingTicketConvictionBatches" +
      " set lockDate = null," +
      " recordUpdate_userName = ?," +
      " recordUpdate_timeMillis = ?" +
      " where recordDelete_timeMillis is null" +
      " and batchID = ?" +
      " and lockDate is not null" +
      " and sentDate is null"
    )
    .run(reqSession.user.userName, rightNowMillis, batchID);

  db.close();

  return info.changes > 0;
};


export default unlockConvictionBatch;
