import type { RequestHandler } from "express";

import { getParkingBylawsWithOffenceStats } from "../../helpers/parkingDB/getParkingBylaws.js";
import deleteParkingBylaw from "../../helpers/parkingDB/deleteParkingBylaw.js";


export const handler: RequestHandler = (req, res) => {

  const results = deleteParkingBylaw(req.body.bylawNumber);

  if (results.success) {

    results.bylaws = getParkingBylawsWithOffenceStats();
  }

  return res.json(results);
};


export default handler;
