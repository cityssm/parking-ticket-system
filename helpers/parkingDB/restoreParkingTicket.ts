import sqlite from "better-sqlite3";

import { parkingDB as dbPath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


export const restoreParkingTicket = (ticketID: number, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath);

  const info = db.prepare("update ParkingTickets" +
    " set recordDelete_userName = null," +
    " recordDelete_timeMillis = null," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where ticketID = ?" +
    " and recordDelete_timeMillis is not null")
    .run(reqSession.user.userName,
      Date.now(),
      ticketID);

  db.close();

  return {
    success: (info.changes > 0)
  };
};


export default restoreParkingTicket;
