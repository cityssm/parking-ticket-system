import sqlite from "better-sqlite3";

import { parkingDB as databasePath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


export const deleteParkingTicketStatus =
(ticketID: number, statusIndex: number, requestSession: expressSession.Session): { success: boolean; } => {

  const database = sqlite(databasePath);

  const info = database.prepare("update ParkingTicketStatusLog" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where ticketID = ?" +
    " and statusIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(requestSession.user.userName,
      Date.now(),
      ticketID,
      statusIndex);

  database.close();

  return {
    success: (info.changes > 0)
  };
};


export default deleteParkingTicketStatus;
