import * as sqlite from "better-sqlite3";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const deleteParkingTicket = (ticketID: number, reqSession: Express.Session) => {

  const db = sqlite(dbPath);

  const info = db.prepare("update ParkingTickets" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where ticketID = ?" +
    " and recordDelete_timeMillis is null")
    .run(reqSession.user.userName,
      Date.now(),
      ticketID);

  db.close();

  return {
    success: (info.changes > 0)
  };
};
