import * as sqlite from "better-sqlite3";

import type { AddUpdateParkingBylawReturn } from "./getParkingBylaws";

import { dbPath } from "../parkingDB";


export const deleteParkingBylaw = (bylawNumber: string): AddUpdateParkingBylawReturn => {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingBylaws" +
    " set isActive = 0" +
    " where bylawNumber = ?" +
    " and isActive = 1")
    .run(bylawNumber);

  db.close();

  return {
    success: (info.changes > 0)
  };

};
