import type { RequestHandler } from "express";

import * as parkingDB_getParkingBylaws from "../../helpers/parkingDB/getParkingBylaws";
import * as parkingDB_addParkingBylaw from "../../helpers/parkingDB/addParkingBylaw";


export const handler: RequestHandler = (req, res) => {

  const results = parkingDB_addParkingBylaw.addParkingBylaw(req.body);

  if (results.success) {

    results.bylaws = parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats();
  }

  return res.json(results);
};
