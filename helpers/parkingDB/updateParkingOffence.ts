import * as sqlite from "better-sqlite3";

import { AddUpdateParkingOffenceReturn } from "./getParkingOffences";
import type * as pts from "../../types/recordTypes";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const updateParkingOffence = (reqBody: pts.ParkingOffence): AddUpdateParkingOffenceReturn => {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingOffences" +
    " set parkingOffence = ?," +
    " offenceAmount = ?," +
    " discountOffenceAmount = ?," +
    " discountDays = ?," +
    " accountNumber = ?" +
    " where bylawNumber = ?" +
    " and locationKey = ?" +
    " and isActive = 1")
    .run(reqBody.parkingOffence,
      reqBody.offenceAmount,
      reqBody.discountOffenceAmount,
      reqBody.discountDays,
      reqBody.accountNumber,
      reqBody.bylawNumber,
      reqBody.locationKey);

  db.close();

  return {
    success: (info.changes > 0)
  };

};
