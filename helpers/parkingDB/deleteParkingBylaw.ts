import sqlite from "better-sqlite3";

import type { AddUpdateParkingBylawReturn } from "./getParkingBylaws";

import { parkingDB as databasePath } from "../../data/databasePaths.js";


export const deleteParkingBylaw = (bylawNumber: string): AddUpdateParkingBylawReturn => {

  const database = sqlite(databasePath);

  // Do update

  const info = database.prepare("update ParkingBylaws" +
    " set isActive = 0" +
    " where bylawNumber = ?" +
    " and isActive = 1")
    .run(bylawNumber);

  database.close();

  return {
    success: (info.changes > 0)
  };
};


export default deleteParkingBylaw;
