import type * as sqlite from "better-sqlite3";


export const canParkingTicketBeAddedToConvictionBatch = (database: sqlite.Database, ticketID: number): boolean => {

  const check = database
    .prepare(
      "select resolvedDate from ParkingTickets" +
      " where ticketID = ?" +
      " and recordDelete_timeMillis is null"
    )
    .get(ticketID);

  if (!check || check.resolvedDate) {
    return false;
  }

  return true;
};


export default canParkingTicketBeAddedToConvictionBatch;
