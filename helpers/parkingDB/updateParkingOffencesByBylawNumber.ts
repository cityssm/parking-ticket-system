import sqlite from "better-sqlite3";

import type { AddUpdateParkingBylawReturn } from "./getParkingBylaws";

import { parkingDB as dbPath } from "../../data/databasePaths.js";


export const updateParkingOffencesByBylawNumber = (reqBody: {
  bylawNumber: string;
  offenceAmount: string;
  discountDays: string;
  discountOffenceAmount: string;
}): AddUpdateParkingBylawReturn => {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingOffences" +
    " set offenceAmount = ?," +
    " discountOffenceAmount = ?," +
    " discountDays = ?" +
    " where bylawNumber = ?" +
    " and isActive = 1")
    .run(reqBody.offenceAmount,
      reqBody.discountOffenceAmount,
      reqBody.discountDays,
      reqBody.bylawNumber);

  db.close();

  return {
    success: (info.changes > 0)
  };

};


export default updateParkingOffencesByBylawNumber;
