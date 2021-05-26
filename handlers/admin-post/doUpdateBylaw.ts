import type { RequestHandler } from "express";

import { getParkingBylawsWithOffenceStats } from "../../helpers/parkingDB/getParkingBylaws.js";
import updateParkingBylaw from "../../helpers/parkingDB/updateParkingBylaw.js";


export const handler: RequestHandler = (req, res) => {

  const results = updateParkingBylaw(req.body);

  if (results.success) {

    results.bylaws = getParkingBylawsWithOffenceStats();
  }

  return res.json(results);
};
