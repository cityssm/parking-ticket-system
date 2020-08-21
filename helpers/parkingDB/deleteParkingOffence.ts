import * as sqlite from "better-sqlite3";

import { AddUpdateParkingOffenceReturn } from "./getParkingOffences";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const deleteParkingOffence = (bylawNumber: string, locationKey: string): AddUpdateParkingOffenceReturn => {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingOffences" +
    " set isActive = 0" +
    " where bylawNumber = ?" +
    " and locationKey = ?" +
    " and isActive = 1")
    .run(bylawNumber, locationKey);

  db.close();

  return {
    success: (info.changes > 0)
  };

};
