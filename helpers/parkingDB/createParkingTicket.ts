import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import * as configFns from "../configFns";
import type * as pts from "../ptsTypes";

import { dbPath } from "../parkingDB";


export const createParkingTicket = (reqBody: pts.ParkingTicket, reqSession: Express.Session) => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const issueDate = dateTimeFns.dateStringToInteger(reqBody.issueDateString);

  if (configFns.getProperty("parkingTickets.ticketNumber.isUnique")) {

    // Ensure ticket number has not been used in the last two years

    const duplicateTicket = db.prepare("select ticketID from ParkingTickets" +
      " where recordDelete_timeMillis is null" +
      " and ticketNumber = ?" +
      " and abs(issueDate - ?) <= 20000")
      .get(reqBody.ticketNumber, issueDate);

    if (duplicateTicket) {

      db.close();

      return {
        success: false,
        message: "A ticket with the same ticket number was seen in the last two years."
      };

    }

  }

  let licencePlateExpiryDate = dateTimeFns.dateStringToInteger(reqBody.licencePlateExpiryDateString);

  if (!configFns.getProperty("parkingTickets.licencePlateExpiryDate.includeDay")) {

    const licencePlateExpiryYear = parseInt(reqBody.licencePlateExpiryYear as string, 10) || 0;
    const licencePlateExpiryMonth = parseInt(reqBody.licencePlateExpiryMonth as string, 10) || 0;

    if (licencePlateExpiryYear === 0 && licencePlateExpiryMonth === 0) {
      licencePlateExpiryDate = 0;

    } else if (licencePlateExpiryYear === 0 || licencePlateExpiryMonth === 0) {

      db.close();

      return {
        success: false,
        message: "The licence plate expiry date fields must both be blank or both be completed."
      };

    } else {

      const dateObj = new Date(licencePlateExpiryYear,
        (licencePlateExpiryMonth - 1) + 1,
        (1 - 1),
        0, 0, 0, 0);

      licencePlateExpiryDate = dateTimeFns.dateToInteger(dateObj);

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
    nextTicketNumber: ""
  };
};
