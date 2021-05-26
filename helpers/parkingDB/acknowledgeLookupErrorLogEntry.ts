import sqlite from "better-sqlite3";

import { parkingDB as dbPath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


export const acknowledgeLookupErrorLogEntry =
  (batchID: number, logIndex: number, reqSession: expressSession.Session) => {

    const db = sqlite(dbPath);

    const info = db.prepare("update LicencePlateLookupErrorLog" +
      " set isAcknowledged = 1," +
      " recordUpdate_userName = ?," +
      " recordUpdate_timeMillis = ?" +
      " where recordDelete_timeMillis is null" +
      " and batchID = ?" +
      " and logIndex = ?" +
      " and isAcknowledged = 0")
      .run(reqSession.user.userName,
        Date.now(),
        batchID,
        logIndex);

    db.close();

    return info.changes > 0;
  };


export default acknowledgeLookupErrorLogEntry;
