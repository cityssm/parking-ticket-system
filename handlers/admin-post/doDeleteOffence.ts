import type { RequestHandler } from "express";

import getParkingOffences from "../../helpers/parkingDB/getParkingOffences.js";
import deleteParkingOffence from "../../helpers/parkingDB/deleteParkingOffence.js";


export const handler: RequestHandler = (req, res) => {

  const results = deleteParkingOffence(req.body.bylawNumber, req.body.locationKey);

  if (results.success) {
    results.offences = getParkingOffences();
  }

  return res.json(results);
};
