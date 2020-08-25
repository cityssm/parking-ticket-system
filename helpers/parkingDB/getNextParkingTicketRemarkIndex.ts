import type * as sqlite from "better-sqlite3";


export const getNextParkingTicketRemarkIndex = (db: sqlite.Database, ticketID: number) => {

  const remarkIndexNew = (db.prepare("select ifnull(max(remarkIndex), 0) as remarkIndexMax" +
    " from ParkingTicketRemarks" +
    " where ticketID = ?")
    .get(ticketID)
    .remarkIndexMax as number) + 1;

  return remarkIndexNew;
};
