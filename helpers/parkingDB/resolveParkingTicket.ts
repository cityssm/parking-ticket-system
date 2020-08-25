import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const resolveParkingTicketWithDB = (db: sqlite.Database, ticketID: number, reqSession: Express.Session) => {

  const rightNow = new Date();

  const info = db.prepare("update ParkingTickets" +
    " set resolvedDate = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where ticketID = ?" +
    " and resolvedDate is null" +
    " and recordDelete_timeMillis is null")
    .run(dateTimeFns.dateToInteger(rightNow),
      reqSession.user.userName,
      rightNow.getTime(),
      ticketID);

  return {
    success: (info.changes > 0)
  };
};


export const resolveParkingTicket = (ticketID: number, reqSession: Express.Session) => {

  const db = sqlite(dbPath);

  const success = resolveParkingTicketWithDB(db, ticketID, reqSession);

  db.close();

  return {
    success
  };
};
