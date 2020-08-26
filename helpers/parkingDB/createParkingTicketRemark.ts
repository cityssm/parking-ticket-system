import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import type * as pts from "../../types/recordTypes";

import { getNextParkingTicketRemarkIndex } from "./getNextParkingTicketRemarkIndex";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const createParkingTicketRemark = (reqBody: pts.ParkingTicketRemark, reqSession: Express.Session) => {

  const db = sqlite(dbPath);

  // Get new remark index

  const remarkIndexNew = getNextParkingTicketRemarkIndex(db, reqBody.ticketID);

  // Create the record

  const rightNow = new Date();

  const info = db.prepare("insert into ParkingTicketRemarks" +
    " (ticketID, remarkIndex, remarkDate, remarkTime, remark," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(reqBody.ticketID,
      remarkIndexNew,
      dateTimeFns.dateToInteger(rightNow),
      dateTimeFns.dateToTimeInteger(rightNow),
      reqBody.remark,
      reqSession.user.userName,
      rightNow.getTime(),
      reqSession.user.userName,
      rightNow.getTime());

  db.close();

  return {
    success: (info.changes > 0)
  };
};
