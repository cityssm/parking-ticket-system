import sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import { parkingDB as databasePath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


export const resolveParkingTicketWithDB =
  (database: sqlite.Database, ticketID: number, requestSession: expressSession.Session): { success: boolean; } => {

    const rightNow = new Date();

    const info = database.prepare("update ParkingTickets" +
      " set resolvedDate = ?," +
      " recordUpdate_userName = ?," +
      " recordUpdate_timeMillis = ?" +
      " where ticketID = ?" +
      " and resolvedDate is null" +
      " and recordDelete_timeMillis is null")
      .run(dateTimeFns.dateToInteger(rightNow),
        requestSession.user.userName,
        rightNow.getTime(),
        ticketID);

    return {
      success: (info.changes > 0)
    };
  };


export const resolveParkingTicket = (ticketID: number, requestSession: expressSession.Session): { success: boolean; } => {

  const database = sqlite(databasePath);

  const success = resolveParkingTicketWithDB(database, ticketID, requestSession);

  database.close();

  return success;
};


export default resolveParkingTicket;
