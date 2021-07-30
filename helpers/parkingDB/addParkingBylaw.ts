import sqlite from "better-sqlite3";

import type { AddUpdateParkingBylawReturn } from "./getParkingBylaws";
import type * as pts from "../../types/recordTypes";

import { parkingDB as databasePath } from "../../data/databasePaths.js";


export const addParkingBylaw = (requestBody: pts.ParkingBylaw): AddUpdateParkingBylawReturn => {

  const database = sqlite(databasePath);

  // Check if key is already used

  const bylawRecord: pts.ParkingBylaw = database.prepare("select bylawDescription, isActive" +
    " from ParkingBylaws" +
    " where bylawNumber = ?")
    .get(requestBody.bylawNumber);

  if (bylawRecord) {

    if (bylawRecord.isActive) {

      database.close();

      return {
        success: false,
        message:
          "By-law number \"" + requestBody.bylawNumber + "\"" +
          " is already associated with the " +
          " record \"" + bylawRecord.bylawDescription + "\"."
      };
    }

    // Do update

    const info = database.prepare("update ParkingBylaws" +
      " set isActive = 1" +
      " where bylawNumber = ?")
      .run(requestBody.bylawNumber);

    database.close();

    return {
      success: (info.changes > 0),
      message: "By-law number \"" + requestBody.bylawNumber + "\" is associated with a previously removed record." +
        " That record has been restored with the original description."
    };
  }

  // Do insert

  const info = database.prepare("insert into ParkingBylaws (" +
    "bylawNumber, bylawDescription, orderNumber, isActive)" +
    " values (?, ?, 0, 1)")
    .run(requestBody.bylawNumber, requestBody.bylawDescription);

  database.close();

  return {
    success: (info.changes > 0)
  };
};


export default addParkingBylaw;
