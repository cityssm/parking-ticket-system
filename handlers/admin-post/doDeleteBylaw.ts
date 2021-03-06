import type { RequestHandler } from "express";

import * as parkingDB_getParkingBylaws from "../../helpers/parkingDB/getParkingBylaws";
import * as parkingDB_deleteParkingBylaw from "../../helpers/parkingDB/deleteParkingBylaw";


export const handler: RequestHandler = (req, res) => {

  const results = parkingDB_deleteParkingBylaw.deleteParkingBylaw(req.body.bylawNumber);

  if (results.success) {

    results.bylaws = parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats();
  }

  return res.json(results);
};
