import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import type * as pts from "../ptsTypes";

import { dbPath, canUpdateObject } from "../parkingDB";


export const getParkingTicketStatuses = (ticketID: number, reqSession: Express.Session) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const statusRows: pts.ParkingTicketStatusLog[] =
    db.prepare("select statusIndex, statusDate, statusTime," +
      " statusKey, statusField, statusField2, statusNote," +
      " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
      " from ParkingTicketStatusLog" +
      " where recordDelete_timeMillis is null" +
      " and ticketID = ?" +
      " order by statusDate desc, statusTime desc, statusIndex desc")
      .all(ticketID);

  db.close();

  for (const status of statusRows) {

    status.recordType = "status";

    status.statusDateString = dateTimeFns.dateIntegerToString(status.statusDate);
    status.statusTimeString = dateTimeFns.timeIntegerToString(status.statusTime);

    status.canUpdate = canUpdateObject(status, reqSession);
  }

  return statusRows;
};
