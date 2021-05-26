import sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import type * as pts from "../../types/recordTypes";

import { canUpdateObject } from "../parkingDB.js";

import { parkingDB as dbPath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


export const getParkingTicketStatusesWithDB = (db: sqlite.Database, ticketID: number, reqSession: expressSession.Session) => {

  const statusRows: pts.ParkingTicketStatusLog[] =
    db.prepare("select * from ParkingTicketStatusLog" +
      " where recordDelete_timeMillis is null" +
      " and ticketID = ?" +
      " order by statusDate desc, statusTime desc, statusIndex desc")
      .all(ticketID);

  for (const status of statusRows) {

    status.recordType = "status";

    status.statusDateString = dateTimeFns.dateIntegerToString(status.statusDate);
    status.statusTimeString = dateTimeFns.timeIntegerToString(status.statusTime);

    status.canUpdate = canUpdateObject(status, reqSession);
  }

  return statusRows;
};


export const getParkingTicketStatuses = (ticketID: number, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const statusRows = getParkingTicketStatusesWithDB(db, ticketID, reqSession);

  db.close();

  return statusRows;
};


export default getParkingTicketStatuses;
