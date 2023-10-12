import sqlite from "better-sqlite3";

import { parkingDB as databasePath } from "../../data/databasePaths.js";


export const isParkingTicketConvictedWithDB = (database: sqlite.Database, ticketID: number): boolean => {

  const convictedStatusCheck = database
    .prepare(
      "select statusIndex from ParkingTicketStatusLog" +
      " where recordDelete_timeMillis is null" +
      " and ticketID = ?" +
      " and statusKey = 'convicted'"
    )
    .get(ticketID);

  if (convictedStatusCheck) {
    return true;
  }

  return false;
};


export const isParkingTicketConvicted = (ticketID: number): boolean => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  const result = isParkingTicketConvictedWithDB(database, ticketID);

  database.close();

  return result;
};


export default isParkingTicketConvicted;
