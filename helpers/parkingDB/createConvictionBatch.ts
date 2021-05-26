import sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import { parkingDB as dbPath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


export const createConvictionBatch = (reqSession: expressSession.Session) => {

  const db = sqlite(dbPath);

  const rightNow = new Date();

  const info = db
    .prepare(
      "insert into ParkingTicketConvictionBatches" +
      " (batchDate, recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
      " values (?, ?, ?, ?, ?)"
    )
    .run(
      dateTimeFns.dateToInteger(rightNow),
      reqSession.user.userName,
      rightNow.getTime(),
      reqSession.user.userName,
      rightNow.getTime()
    );

  db.close();

  if (info.changes > 0) {
    return {
      success: true,
      batch: {
        batchID: info.lastInsertRowid,
        batchDate: dateTimeFns.dateToInteger(rightNow),
        batchDateString: dateTimeFns.dateToString(rightNow),
        lockDate: null,
        lockDateString: "",
        batchEntries: []
      }
    };
  } else {
    return { success: false };
  }
};


export default createConvictionBatch;
