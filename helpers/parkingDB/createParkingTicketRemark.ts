import sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import type * as pts from "../../types/recordTypes";

import { getNextParkingTicketRemarkIndex } from "./getNextParkingTicketRemarkIndex.js";

import { parkingDB as databasePath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


export const createParkingTicketRemark =
  (requestBody: pts.ParkingTicketRemark, requestSession: expressSession.Session): { success: boolean; } => {

    const database = sqlite(databasePath);

    // Get new remark index

    const remarkIndexNew = getNextParkingTicketRemarkIndex(database, requestBody.ticketID);

    // Create the record

    const rightNow = new Date();

    const info = database.prepare("insert into ParkingTicketRemarks" +
      " (ticketID, remarkIndex, remarkDate, remarkTime, remark," +
      " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
      " values (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(requestBody.ticketID,
        remarkIndexNew,
        dateTimeFns.dateToInteger(rightNow),
        dateTimeFns.dateToTimeInteger(rightNow),
        requestBody.remark,
        requestSession.user.userName,
        rightNow.getTime(),
        requestSession.user.userName,
        rightNow.getTime());

    database.close();

    return {
      success: (info.changes > 0)
    };
  };


export default createParkingTicketRemark;
