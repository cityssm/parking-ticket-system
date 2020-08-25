import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import type * as pts from "../ptsTypes";

import { getNextParkingTicketStatusIndex } from "./getNextParkingTicketStatusIndex";
import { resolveParkingTicketWithDB } from "./resolveParkingTicket";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const createParkingTicketStatus =
  (reqBodyOrObj: pts.ParkingTicketStatusLog, reqSession: Express.Session, resolveTicket: boolean) => {

    const db = sqlite(dbPath);

    // Get new status index

    const statusIndexNew = getNextParkingTicketStatusIndex(db, reqBodyOrObj.ticketID);

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
      resolveParkingTicketWithDB(db, reqBodyOrObj.ticketID, reqSession);
    }

    db.close();

    return {
      success: (info.changes > 0),
      statusIndex: statusIndexNew
    };
  };
