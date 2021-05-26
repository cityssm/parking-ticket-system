import sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import type * as pts from "../../types/recordTypes";

import getNextParkingTicketRemarkIndex from "./getNextParkingTicketRemarkIndex.js";

import { parkingDB as dbPath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


export const createParkingTicketRemark = (reqBody: pts.ParkingTicketRemark, reqSession: expressSession.Session) => {

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


export default createParkingTicketRemark;
