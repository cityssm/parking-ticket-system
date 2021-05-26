import sqlite from "better-sqlite3";

import type { AddUpdateParkingLocationReturn } from "./getParkingLocations";

import { parkingDB as dbPath } from "../../data/databasePaths.js";


export const deleteParkingLocation = (locationKey: string): AddUpdateParkingLocationReturn => {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingLocations" +
    " set isActive = 0" +
    " where locationKey = ?" +
    " and isActive = 1")
    .run(locationKey);

  db.close();

  return {
    success: (info.changes > 0)
  };
};


export default deleteParkingLocation;
