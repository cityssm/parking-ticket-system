import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import type * as pts from "../ptsTypes";

import { dbPath } from "../parkingDB";


export const createParkingTicketStatus =
  (reqBodyOrObj: pts.ParkingTicketStatusLog, reqSession: Express.Session, resolveTicket: boolean) => {

    const db = sqlite(dbPath);

    // Get new status index

    const statusIndexNew =
      (db.prepare("select ifnull(max(statusIndex), 0) as statusIndexMax" +
        " from ParkingTicketStatusLog" +
        " where ticketID = ?")
        .get(reqBodyOrObj.ticketID)
        .statusIndexMax as number) + 1;

    // Create the record

    const rightNow = new Date();

    const info = db.prepare("insert into ParkingTicketStatusLog" +
      " (ticketID, statusIndex, statusDate, statusTime, statusKey," +
      " statusField, statusField2, statusNote," +
      " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
      " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(reqBodyOrObj.ticketID,
        statusIndexNew,
        dateTimeFns.dateToInteger(rightNow),
        dateTimeFns.dateToTimeInteger(rightNow),
        reqBodyOrObj.statusKey,
        reqBodyOrObj.statusField,
        reqBodyOrObj.statusField2,
        reqBodyOrObj.statusNote,
        reqSession.user.userName,
        rightNow.getTime(),
        reqSession.user.userName,
        rightNow.getTime());

    if (info.changes > 0 && resolveTicket) {

      db.prepare("update ParkingTickets" +
        " set resolvedDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where ticketID = ?" +
        " and resolvedDate is null" +
        " and recordDelete_timeMillis is null")
        .run(dateTimeFns.dateToInteger(rightNow),
          reqSession.user.userName,
          rightNow.getTime(),
          reqBodyOrObj.ticketID);

    }

    db.close();

    return {
      success: (info.changes > 0),
      statusIndex: statusIndexNew
    };

  };
