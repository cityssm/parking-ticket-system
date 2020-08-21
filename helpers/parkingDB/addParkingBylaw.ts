import * as sqlite from "better-sqlite3";

import type { AddUpdateParkingBylawReturn } from "./getParkingBylaws";
import type * as pts from "../ptsTypes";

import { dbPath } from "../parkingDB";


export const addParkingBylaw = (reqBody: pts.ParkingBylaw): AddUpdateParkingBylawReturn => {

  const db = sqlite(dbPath);

  // Check if key is already used

  const bylawRecord: pts.ParkingBylaw = db.prepare("select bylawDescription, isActive" +
    " from ParkingBylaws" +
    " where bylawNumber = ?")
    .get(reqBody.bylawNumber);

  if (bylawRecord) {

    if (bylawRecord.isActive) {

      db.close();

      return {
        success: false,
        message:
          "By-law number \"" + reqBody.bylawNumber + "\"" +
          " is already associated with the " +
          " record \"" + bylawRecord.bylawDescription + "\"."
      };

    }

    // Do update

    const info = db.prepare("update ParkingBylaws" +
      " set isActive = 1" +
      " where bylawNumber = ?")
      .run(reqBody.bylawNumber);

    db.close();

    return {
      success: (info.changes > 0),
      message: "By-law number \"" + reqBody.bylawNumber + "\" is associated with a previously removed record." +
        " That record has been restored with the original description."
    };

  }

  // Do insert

  const info = db.prepare("insert into ParkingBylaws (" +
    "bylawNumber, bylawDescription, orderNumber, isActive)" +
    " values (?, ?, 0, 1)")
    .run(reqBody.bylawNumber, reqBody.bylawDescription);

  db.close();

  return {
    success: (info.changes > 0)
  };

};
