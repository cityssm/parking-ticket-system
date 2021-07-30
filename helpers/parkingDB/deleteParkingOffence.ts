import sqlite from "better-sqlite3";

import type { AddUpdateParkingOffenceReturn } from "./getParkingOffences";

import { parkingDB as databasePath } from "../../data/databasePaths.js";


export const deleteParkingOffence = (bylawNumber: string, locationKey: string): AddUpdateParkingOffenceReturn => {

  const database = sqlite(databasePath);

  // Do update

  const info = database.prepare("update ParkingOffences" +
    " set isActive = 0" +
    " where bylawNumber = ?" +
    " and locationKey = ?" +
    " and isActive = 1")
    .run(bylawNumber, locationKey);

  database.close();

  return {
    success: (info.changes > 0)
  };
};


export default deleteParkingOffence;
