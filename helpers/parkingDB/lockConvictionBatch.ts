import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import { dbPath } from "../parkingDB";


export const lockConvictionBatch = (
  batchID: number,
  reqSession: Express.Session
) => {
  const db = sqlite(dbPath);

  const rightNow = new Date();

  const lockDate = dateTimeFns.dateToInteger(rightNow);

  const info = db
    .prepare(
      "update ParkingTicketConvictionBatches" +
      " set lockDate = ?," +
      " recordUpdate_userName = ?," +
      " recordUpdate_timeMillis = ?" +
      " where recordDelete_timeMillis is null" +
      " and batchID = ?" +
      " and lockDate is null"
    )
    .run(lockDate, reqSession.user.userName, rightNow.getTime(), batchID);

  db.close();

  return {
    success: info.changes > 0,
    lockDate,
    lockDateString: dateTimeFns.dateIntegerToString(lockDate)
  };
};
