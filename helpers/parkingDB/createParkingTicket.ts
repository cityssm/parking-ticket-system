import sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as configFns from "../configFns.js";
import type * as pts from "../../types/recordTypes";

import { getLicencePlateExpiryDateFromPieces } from "./updateParkingTicket.js";

import { parkingDB as dbPath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


const hasDuplicateTicket = (db: sqlite.Database, ticketNumber: string, issueDate: number) => {

  const duplicateTicket = db.prepare("select ticketID from ParkingTickets" +
    " where recordDelete_timeMillis is null" +
    " and ticketNumber = ?" +
    " and abs(issueDate - ?) <= 20000")
    .get(ticketNumber, issueDate);

  if (duplicateTicket) {
    return true;
  }

  return false;
};


export const createParkingTicket = (reqBody: pts.ParkingTicket, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const issueDate = dateTimeFns.dateStringToInteger(reqBody.issueDateString);

  if (configFns.getProperty("parkingTickets.ticketNumber.isUnique")) {

    if (hasDuplicateTicket(db, reqBody.ticketNumber, issueDate)) {

      db.close();

      return {
        success: false,
        message: "A ticket with the same ticket number was seen in the last two years."
      };
    }
  }

  let licencePlateExpiryDate = dateTimeFns.dateStringToInteger(reqBody.licencePlateExpiryDateString);

  if (!configFns.getProperty("parkingTickets.licencePlateExpiryDate.includeDay")) {

    const licencePlateExpiryDateReturn = getLicencePlateExpiryDateFromPieces(reqBody);

    if (licencePlateExpiryDateReturn.success) {
      licencePlateExpiryDate = licencePlateExpiryDateReturn.licencePlateExpiryDate;

    } else {
      db.close();

      return {
        success: false,
        message: licencePlateExpiryDateReturn.message
      };
    }
  }

  const info = db.prepare("insert into ParkingTickets" +
    " (ticketNumber, issueDate, issueTime, issuingOfficer," +
    " locationKey, locationDescription," +
    " bylawNumber, parkingOffence, offenceAmount, discountOffenceAmount, discountDays," +
    " licencePlateCountry, licencePlateProvince, licencePlateNumber," +
    " licencePlateIsMissing, licencePlateExpiryDate, vehicleMakeModel, vehicleVIN," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(reqBody.ticketNumber,
      issueDate,
      dateTimeFns.timeStringToInteger(reqBody.issueTimeString),
      reqBody.issuingOfficer,
      reqBody.locationKey,
      reqBody.locationDescription,
      reqBody.bylawNumber,
      reqBody.parkingOffence,
      reqBody.offenceAmount,
      reqBody.discountOffenceAmount,
      reqBody.discountDays,
      reqBody.licencePlateCountry,
      reqBody.licencePlateProvince,
      reqBody.licencePlateNumber,
      (reqBody.licencePlateIsMissing ? 1 : 0),
      licencePlateExpiryDate,
      reqBody.vehicleMakeModel,
      reqBody.vehicleVIN,
      reqSession.user.userName,
      nowMillis,
      reqSession.user.userName,
      nowMillis
    );

  db.close();

  return {
    success: true,
    ticketID: info.lastInsertRowid,
    nextTicketNumber: "" // populated in handler
  };
};


export default createParkingTicket;
