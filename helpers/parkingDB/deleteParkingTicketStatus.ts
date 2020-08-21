import * as sqlite from "better-sqlite3";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const deleteParkingTicketStatus = (ticketID: number, statusIndex: number, reqSession: Express.Session) => {

  const db = sqlite(dbPath);

  const info = db.prepare("update ParkingTicketStatusLog" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where ticketID = ?" +
    " and statusIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(reqSession.user.userName,
      Date.now(),
      ticketID,
      statusIndex);

  db.close();

  return {
    success: (info.changes > 0)
  };
};
