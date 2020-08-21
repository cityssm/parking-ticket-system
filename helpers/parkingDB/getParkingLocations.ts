import * as sqlite from "better-sqlite3";

import type * as pts from "../ptsTypes";

import { parkingDB as dbPath } from "../../data/databasePaths";


export interface AddUpdateParkingLocationReturn {
  success: boolean;
  message?: string;
  locations?: pts.ParkingLocation[];
}


export const getParkingLocations = () => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: pts.ParkingLocation[] = db.prepare("select locationKey, locationName, locationClassKey" +
    " from ParkingLocations" +
    " where isActive = 1" +
    " order by orderNumber, locationName")
    .all();

  db.close();

  return rows;
};
