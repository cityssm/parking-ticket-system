import * as sqlite from "better-sqlite3";

import { parkingDB as dbPath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


export const deleteParkingTicketRemark = (ticketID: number, remarkIndex: number, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath);

  const info = db.prepare("update ParkingTicketRemarks" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where ticketID = ?" +
    " and remarkIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(reqSession.user.userName,
      Date.now(),
      ticketID,
      remarkIndex);

  db.close();

  return {
    success: (info.changes > 0)
  };
};


export default deleteParkingTicketRemark;
