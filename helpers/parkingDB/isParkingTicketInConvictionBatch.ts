import type * as sqlite from "better-sqlite3";


export const isParkingTicketInConvictionBatch = (db: sqlite.Database, ticketID: number) => {

  const batchStatusCheck = db
    .prepare(
      "select statusField from ParkingTicketStatusLog" +
      " where recordDelete_timeMillis is null" +
      " and ticketID = ?" +
      " and statusKey = 'convictionBatch'"
    )
    .get(ticketID);

  if (batchStatusCheck) {
    return {
      inBatch: true,
      batchIDString: batchStatusCheck.statusField as string
    };
  }

  return {
    inBatch: false
  };
};
