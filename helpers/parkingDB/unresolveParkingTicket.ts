import * as sqlite from "better-sqlite3";

import * as configFns from "../configFns";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const unresolveParkingTicket = (ticketID: number, reqSession: Express.Session) => {

  const db = sqlite(dbPath);

  // Check if the ticket is in the window

  const ticketObj: {
    recordUpdate_timeMillis: number;
  } = db.prepare("select recordUpdate_timeMillis from ParkingTickets" +
    " where ticketID = ?" +
    " and recordDelete_timeMillis is null" +
    " and resolvedDate is not null")
    .get(ticketID);

  if (!ticketObj) {

    db.close();

    return {
      success: false,
      message: "The ticket has either been deleted, or is no longer marked as resolved."
    };

  } else if (ticketObj.recordUpdate_timeMillis + configFns.getProperty("user.createUpdateWindowMillis") < Date.now()) {

    db.close();

    return {
      success: false,
      message: "The ticket is outside of the window for removing the resolved status."
    };

  }

  const info = db.prepare("update ParkingTickets" +
    " set resolvedDate = null," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where ticketID = ?" +
    " and resolvedDate is not null" +
    " and recordDelete_timeMillis is null")
    .run(reqSession.user.userName,
      Date.now(),
      ticketID);

  db.close();

  return {
    success: (info.changes > 0)
  };
};
