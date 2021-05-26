import sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import type * as pts from "../../types/recordTypes";

import getNextParkingTicketStatusIndex from "./getNextParkingTicketStatusIndex.js";
import { resolveParkingTicketWithDB } from "./resolveParkingTicket.js";

import { parkingDB as dbPath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


export const createParkingTicketStatusWithDB =
  (db: sqlite.Database, reqBodyOrObj: pts.ParkingTicketStatusLog, reqSession: expressSession.Session, resolveTicket: boolean) => {

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

    return {
      success: (info.changes > 0),
      statusIndex: statusIndexNew
    };
  };


export const createParkingTicketStatus =
  (reqBodyOrObj: pts.ParkingTicketStatusLog, reqSession: expressSession.Session, resolveTicket: boolean) => {

    const db = sqlite(dbPath);

    const result = createParkingTicketStatusWithDB(db, reqBodyOrObj, reqSession, resolveTicket);

    db.close();

    return result;
  };


export default createParkingTicketStatus;
