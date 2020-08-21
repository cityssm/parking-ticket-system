import * as sqlite from "better-sqlite3";

import { AddUpdateParkingOffenceReturn } from "./getParkingOffences";
import type * as pts from "../ptsTypes";

import { dbPath } from "../parkingDB";


export const addParkingOffence = (reqBody: pts.ParkingOffence): AddUpdateParkingOffenceReturn => {

  const db = sqlite(dbPath);

  // Check if offence already exists

  const existingOffenceRecord: pts.ParkingOffence = db.prepare("select isActive" +
    " from ParkingOffences" +
    " where bylawNumber = ?" +
    " and locationKey = ?")
    .get(reqBody.bylawNumber, reqBody.locationKey);

  if (existingOffenceRecord) {

    if (existingOffenceRecord.isActive) {

      db.close();

      return {
        success: false,
        message: "An active offence already exists for the same location and by-law."
      };

    } else {

      const info = db.prepare("update ParkingOffences" +
        " set isActive = 1" +
        " where bylawNumber = ?" +
        " and locationKey = ?")
        .run(reqBody.bylawNumber, reqBody.locationKey);

      db.close();

      return {
        success: (info.changes > 0),
        message: "A previously deleted offence for the same location and by-law has been restored."
      };

    }

  }

  // Check if another offence exists for the same by-law
  // If so, use the same offenceAmount

  let offenceAmount = 0;
  let discountOffenceAmount = 0;
  let discountDays = 0;

  if (reqBody.hasOwnProperty("offenceAmount")) {

    offenceAmount = reqBody.offenceAmount;

    discountOffenceAmount = reqBody.hasOwnProperty("discountOffenceAmount")
      ? reqBody.discountOffenceAmount
      : reqBody.offenceAmount;

    discountDays = reqBody.discountDays || 0;

  } else {

    const offenceAmountRecord: pts.ParkingOffence = db.prepare(
      "select offenceAmount, discountOffenceAmount, discountDays" +
      " from ParkingOffences" +
      " where bylawNumber = ?" +
      " and isActive = 1" +
      " group by offenceAmount, discountOffenceAmount, discountDays" +
      " order by count(locationKey) desc, offenceAmount desc, discountOffenceAmount desc" +
      " limit 1")
      .get(reqBody.bylawNumber);

    if (offenceAmountRecord) {
      offenceAmount = offenceAmountRecord.offenceAmount;
      discountOffenceAmount = offenceAmountRecord.discountOffenceAmount;
      discountDays = offenceAmountRecord.discountDays;
    }
  }

  // Insert record

  const info = db.prepare("insert into ParkingOffences" +
    " (bylawNumber, locationKey, parkingOffence," +
    " offenceAmount, discountOffenceAmount, discountDays," +
    " accountNumber, isActive)" +
    " values (?, ?, ?, ?, ?, ?, ?, 1)")
    .run(reqBody.bylawNumber,
      reqBody.locationKey,
      reqBody.parkingOffence || "",
      offenceAmount,
      discountOffenceAmount,
      discountDays,
      reqBody.accountNumber || "");

  db.close();

  return {
    success: (info.changes > 0)
  };
};
