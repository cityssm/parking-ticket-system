import sqlite from "better-sqlite3";

import type { AddUpdateParkingLocationReturn } from "./getParkingLocations";
import type * as pts from "../../types/recordTypes";

import { parkingDB as dbPath } from "../../data/databasePaths.js";


export const updateParkingLocation = (reqBody: pts.ParkingLocation): AddUpdateParkingLocationReturn => {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingLocations" +
    " set locationName = ?," +
    " locationClassKey = ?" +
    " where locationKey = ?" +
    " and isActive = 1")
    .run(reqBody.locationName, reqBody.locationClassKey, reqBody.locationKey);

  db.close();

  return {
    success: (info.changes > 0)
  };
};


export default updateParkingLocation;
