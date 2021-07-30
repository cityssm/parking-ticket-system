import sqlite from "better-sqlite3";

import type * as pts from "../../types/recordTypes";

import { parkingDB as databasePath } from "../../data/databasePaths.js";


export interface AddUpdateParkingLocationReturn {
  success: boolean;
  message?: string;
  locations?: pts.ParkingLocation[];
}


export const getParkingLocations = (): pts.ParkingLocation[] => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  const rows: pts.ParkingLocation[] = database.prepare("select locationKey, locationName, locationClassKey" +
    " from ParkingLocations" +
    " where isActive = 1" +
    " order by orderNumber, locationName")
    .all();

  database.close();

  return rows;
};


export default getParkingLocations;
