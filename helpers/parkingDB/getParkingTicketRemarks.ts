import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import type * as pts from "../../types/recordTypes";

import { canUpdateObject } from "../parkingDB";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const getParkingTicketRemarksWithDB = (db: sqlite.Database, ticketID: number, reqSession: Express.Session) => {

  const remarkRows: pts.ParkingTicketRemark[] =
    db.prepare("select * from ParkingTicketRemarks" +
      " where recordDelete_timeMillis is null" +
      " and ticketID = ?" +
      " order by remarkDate desc, remarkTime desc, remarkIndex desc")
      .all(ticketID);

  for (const remark of remarkRows) {

    remark.recordType = "remark";

    remark.remarkDateString = dateTimeFns.dateIntegerToString(remark.remarkDate);
    remark.remarkTimeString = dateTimeFns.timeIntegerToString(remark.remarkTime);

    remark.canUpdate = canUpdateObject(remark, reqSession);
  }

  return remarkRows;
};


export const getParkingTicketRemarks = (ticketID: number, reqSession: Express.Session) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const remarkRows = getParkingTicketRemarksWithDB(db, ticketID, reqSession);

  return remarkRows;
};
