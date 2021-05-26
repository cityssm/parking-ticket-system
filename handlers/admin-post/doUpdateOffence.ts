import type { RequestHandler } from "express";

import getParkingOffences from "../../helpers/parkingDB/getParkingOffences.js";
import updateParkingOffence from "../../helpers/parkingDB/updateParkingOffence.js";


export const handler: RequestHandler = (req, res) => {

  const results = updateParkingOffence(req.body);

  if (results.success) {
    results.offences = getParkingOffences();
  }

  return res.json(results);
};
