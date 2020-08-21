import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const markLookupBatchAsSent = (batchID: number, reqSession: Express.Session) => {

  const db = sqlite(dbPath);

  const rightNow = new Date();

  const info = db.prepare("update LicencePlateLookupBatches" +
    " set sentDate = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where batchID = ?" +
    " and recordDelete_timeMillis is null" +
    " and lockDate is not null" +
    " and sentDate is null")
    .run(dateTimeFns.dateToInteger(rightNow),
      reqSession.user.userName,
      rightNow.getTime(),
      batchID);

  db.close();

  return (info.changes > 0);
};
