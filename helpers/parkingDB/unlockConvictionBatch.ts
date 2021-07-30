import sqlite from "better-sqlite3";

import { parkingDB as databasePath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


export const unlockConvictionBatch = (
  batchID: number,
  requestSession: expressSession.Session
): boolean => {

  const database = sqlite(databasePath);

  const rightNowMillis = Date.now();

  const info = database
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
    .run(requestSession.user.userName, rightNowMillis, batchID);

  database.close();

  return info.changes > 0;
};


export default unlockConvictionBatch;
