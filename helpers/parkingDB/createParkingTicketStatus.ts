import sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import type * as pts from "../../types/recordTypes";

import { getNextParkingTicketStatusIndex } from "./getNextParkingTicketStatusIndex.js";
import { resolveParkingTicketWithDB } from "./resolveParkingTicket.js";

import { parkingDB as databasePath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


interface CreateParkingTicketStatusReturn {
  success: boolean;
  statusIndex?: number;
}


export const createParkingTicketStatusWithDB =
  (database: sqlite.Database,
    requestBodyOrObject: pts.ParkingTicketStatusLog, requestSession: expressSession.Session, resolveTicket: boolean): CreateParkingTicketStatusReturn => {

    // Get new status index

    const statusIndexNew = getNextParkingTicketStatusIndex(database, requestBodyOrObject.ticketID);

    // Create the record

    const rightNow = new Date();

    const info = database.prepare("insert into ParkingTicketStatusLog" +
      " (ticketID, statusIndex, statusDate, statusTime, statusKey," +
      " statusField, statusField2, statusNote," +
      " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
      " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(requestBodyOrObject.ticketID,
        statusIndexNew,
        dateTimeFns.dateToInteger(rightNow),
        dateTimeFns.dateToTimeInteger(rightNow),
        requestBodyOrObject.statusKey,
        requestBodyOrObject.statusField,
        requestBodyOrObject.statusField2,
        requestBodyOrObject.statusNote,
        requestSession.user.userName,
        rightNow.getTime(),
        requestSession.user.userName,
        rightNow.getTime());

    if (info.changes > 0 && resolveTicket) {
      resolveParkingTicketWithDB(database, requestBodyOrObject.ticketID, requestSession);
    }

    return {
      success: (info.changes > 0),
      statusIndex: statusIndexNew
    };
  };


export const createParkingTicketStatus =
  (requestBodyOrObject: pts.ParkingTicketStatusLog, requestSession: expressSession.Session, resolveTicket: boolean): CreateParkingTicketStatusReturn => {

    const database = sqlite(databasePath);

    const result = createParkingTicketStatusWithDB(database, requestBodyOrObject, requestSession, resolveTicket);

    database.close();

    return result;
  };


export default createParkingTicketStatus;
