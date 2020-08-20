import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import { dbPath } from "../parkingDB";


export const resolveParkingTicket = (ticketID: number, reqSession: Express.Session) => {

  const db = sqlite(dbPath);

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

  db.close();

  return {
    success: (info.changes > 0)
  };
};
