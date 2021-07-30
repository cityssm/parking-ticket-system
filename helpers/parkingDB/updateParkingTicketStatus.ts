import sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import type * as pts from "../../types/recordTypes";

import { parkingDB as databasePath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


export const updateParkingTicketStatus =
  (requestBody: pts.ParkingTicketStatusLog, requestSession: expressSession.Session): { success: boolean; } => {

    const database = sqlite(databasePath);

    const info = database.prepare("update ParkingTicketStatusLog" +
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
        dateTimeFns.dateStringToInteger(requestBody.statusDateString),
        dateTimeFns.timeStringToInteger(requestBody.statusTimeString),
        requestBody.statusKey,
        requestBody.statusField,
        requestBody.statusField2,
        requestBody.statusNote,
        requestSession.user.userName,
        Date.now(),
        requestBody.ticketID,
        requestBody.statusIndex);

    database.close();

    return {
      success: (info.changes > 0)
    };
  };


export default updateParkingTicketStatus;
