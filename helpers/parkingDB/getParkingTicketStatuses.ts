import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import type * as pts from "../ptsTypes";

import { canUpdateObject } from "../parkingDB";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const getParkingTicketStatusesWithDB = (db: sqlite.Database, ticketID: number, reqSession: Express.Session) => {

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


export const getParkingTicketStatuses = (ticketID: number, reqSession: Express.Session) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const statusRows = getParkingTicketStatusesWithDB(db, ticketID, reqSession);

  db.close();

  return statusRows;
};
