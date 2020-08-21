import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import type * as pts from "../ptsTypes";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const updateParkingTicketStatus = (reqBody: pts.ParkingTicketStatusLog, reqSession: Express.Session) => {

  const db = sqlite(dbPath);

  const info = db.prepare("update ParkingTicketStatusLog" +
    " set statusDate = ?," +
    " statusTime = ?," +
    " statusKey = ?," +
    " statusField = ?," +
    " statusField2 = ?," +
    " statusNote = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where ticketID = ?" +
    " and statusIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      dateTimeFns.dateStringToInteger(reqBody.statusDateString),
      dateTimeFns.timeStringToInteger(reqBody.statusTimeString),
      reqBody.statusKey,
      reqBody.statusField,
      reqBody.statusField2,
      reqBody.statusNote,
      reqSession.user.userName,
      Date.now(),
      reqBody.ticketID,
      reqBody.statusIndex);

  db.close();

  return {
    success: (info.changes > 0)
  };
};
