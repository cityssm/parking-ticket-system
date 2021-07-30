import sqlite from "better-sqlite3";

import type { AddUpdateParkingOffenceReturn } from "./getParkingOffences";

import { parkingDB as databasePath } from "../../data/databasePaths.js";


export const updateParkingOffencesByBylawNumber = (requestBody: {
  bylawNumber: string;
  offenceAmount: string;
  discountDays: string;
  discountOffenceAmount: string;
}): AddUpdateParkingOffenceReturn => {

  const database = sqlite(databasePath);

  // Do update

  const info = database.prepare("update ParkingOffences" +
    " set offenceAmount = ?," +
    " discountOffenceAmount = ?," +
    " discountDays = ?" +
    " where bylawNumber = ?" +
    " and isActive = 1")
    .run(requestBody.offenceAmount,
      requestBody.discountOffenceAmount,
      requestBody.discountDays,
      requestBody.bylawNumber);

  database.close();

  return {
    success: (info.changes > 0)
  };
};


export default updateParkingOffencesByBylawNumber;
