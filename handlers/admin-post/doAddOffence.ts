import type { RequestHandler } from "express";

import getParkingOffences from "../../helpers/parkingDB/getParkingOffences.js";
import addParkingOffence from "../../helpers/parkingDB/addParkingOffence.js";


export const handler: RequestHandler = (req, res) => {

  const results = addParkingOffence(req.body);

  if (results.success && req.body.returnOffences) {

    results.offences = getParkingOffences();
  }

  res.json(results);
};


export default handler;
