import type * as sqlite from "better-sqlite3";


export const getNextParkingTicketStatusIndex = (db: sqlite.Database, ticketID: number) => {

  const statusIndexNew =
    (db.prepare("select ifnull(max(statusIndex), 0) as statusIndexMax" +
      " from ParkingTicketStatusLog" +
      " where ticketID = ?")
      .get(ticketID)
      .statusIndexMax as number) + 1;

  return statusIndexNew;
};
