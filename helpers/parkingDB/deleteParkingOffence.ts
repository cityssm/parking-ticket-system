import sqlite from "better-sqlite3";

import type { AddUpdateParkingOffenceReturn } from "./getParkingOffences";

import { parkingDB as dbPath } from "../../data/databasePaths.js";


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


export default deleteParkingOffence;
