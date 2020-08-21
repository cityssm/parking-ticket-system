import * as sqlite from "better-sqlite3";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const cleanupParkingTicketsTable = (recordDelete_timeMillis: number) => {

  const db = sqlite(dbPath);

  const recordsToDelete = db.prepare("select ticketID from ParkingTickets t" +
    " where t.recordDelete_timeMillis is not null" +
    " and t.recordDelete_timeMillis < ?" +
    (" and not exists (" +
      "select 1 from LicencePlateLookupBatchEntries b" +
      " where t.ticketID = b.ticketID)"))
    .all(recordDelete_timeMillis);

  for (const recordToDelete of recordsToDelete) {

    db.prepare("delete from ParkingTicketRemarks" +
      " where ticketID = ?")
      .run(recordToDelete.ticketID);

    db.prepare("delete from ParkingTicketStatusLog" +
      " where ticketID = ?")
      .run(recordToDelete.ticketID);

    db.prepare("delete from ParkingTickets" +
      " where ticketID = ?")
      .run(recordToDelete.ticketID);
  }

  db.close();

  return true;

};
