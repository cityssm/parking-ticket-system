import type { RequestHandler } from "express";

import * as parkingDB_getParkingBylaws from "../../helpers/parkingDB/getParkingBylaws";
import * as parkingDB_updateParkingBylaw from "../../helpers/parkingDB/updateParkingBylaw";


export const handler: RequestHandler = (req, res) => {

  const results = parkingDB_updateParkingBylaw.updateParkingBylaw(req.body);

  if (results.success) {

    results.bylaws = parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats();
  }

  return res.json(results);
};
