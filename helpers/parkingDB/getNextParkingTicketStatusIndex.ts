import type * as sqlite from "better-sqlite3";


export const getNextParkingTicketStatusIndex = (database: sqlite.Database, ticketID: number): number => {

  const statusIndexNew =
    (database.prepare("select ifnull(max(statusIndex), 0) as statusIndexMax" +
      " from ParkingTicketStatusLog" +
      " where ticketID = ?")
      .get(ticketID)
      .statusIndexMax as number) + 1;

  return statusIndexNew;
};


export default getNextParkingTicketStatusIndex;
