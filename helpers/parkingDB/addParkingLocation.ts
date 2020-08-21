import * as sqlite from "better-sqlite3";

import type { AddUpdateParkingLocationReturn } from "./getParkingLocations";
import type * as pts from "../ptsTypes";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const addParkingLocation = (reqBody: pts.ParkingLocation): AddUpdateParkingLocationReturn => {

  const db = sqlite(dbPath);

  // Check if key is already used

  const locationRecord: pts.ParkingLocation = db.prepare("select locationName, isActive" +
    " from ParkingLocations" +
    " where locationKey = ?")
    .get(reqBody.locationKey);

  if (locationRecord) {

    db.close();

    return {
      success: false,
      message:
        "The location key \"" + reqBody.locationKey + "\"" +
        " is already associated with the " +
        (locationRecord.isActive ? "" : "inactive ") +
        " record \"" + locationRecord.locationName + "\"."
    };
  }

  // Do insert

  const info = db.prepare("insert into ParkingLocations (" +
    "locationKey, locationName, locationClassKey, orderNumber, isActive)" +
    " values (?, ?, ?, 0, 1)")
    .run(reqBody.locationKey, reqBody.locationName, reqBody.locationClassKey);

  db.close();

  return {
    success: (info.changes > 0)
  };

};
