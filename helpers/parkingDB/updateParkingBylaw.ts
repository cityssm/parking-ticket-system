import * as sqlite from "better-sqlite3";

import type { AddUpdateParkingBylawReturn } from "./getParkingBylaws";
import type * as pts from "../ptsTypes";

import { dbPath } from "../parkingDB";


export const updateParkingBylaw = (reqBody: pts.ParkingBylaw): AddUpdateParkingBylawReturn => {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingBylaws" +
    " set bylawDescription = ?" +
    " where bylawNumber = ?" +
    " and isActive = 1")
    .run(reqBody.bylawDescription, reqBody.bylawNumber);

  db.close();

  return {
    success: (info.changes > 0)
  };

};
