import * as sqlite from "better-sqlite3";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const isParkingTicketConvictedWithDB = (db: sqlite.Database, ticketID: number) => {

  const convictedStatusCheck = db
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


export const isParkingTicketConvicted = (ticketID: number) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const result = isParkingTicketConvictedWithDB(db, ticketID);

  db.close();

  return result;
};
