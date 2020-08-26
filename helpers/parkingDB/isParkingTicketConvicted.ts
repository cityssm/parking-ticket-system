import type * as sqlite from "better-sqlite3";


export const isParkingTicketConvicted = (db: sqlite.Database, ticketID: number) => {

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
