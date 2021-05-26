import sqlite from "better-sqlite3";

import { parkingDB as dbPath } from "../../data/databasePaths.js";


export const getParkingTicketID = (ticketNumber: string) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const ticketRow = db.prepare("select ticketID" +
    " from ParkingTickets" +
    " where ticketNumber = ?" +
    " and recordDelete_timeMillis is null" +
    " order by ticketID desc" +
    " limit 1")
    .get(ticketNumber);

  db.close();

  if (ticketRow) {
    return ticketRow.ticketID as number;
  }

  return null;
};


export default getParkingTicketID;
