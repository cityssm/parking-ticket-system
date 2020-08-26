import type { RequestHandler } from "express";

import * as parkingDB_getParkingOffences from "../../helpers/parkingDB/getParkingOffences";
import * as parkingDB_deleteParkingOffence from "../../helpers/parkingDB/deleteParkingOffence";


export const handler: RequestHandler = (req, res) => {

  const results = parkingDB_deleteParkingOffence.deleteParkingOffence(req.body.bylawNumber, req.body.locationKey);

  if (results.success) {

    results.offences = parkingDB_getParkingOffences.getParkingOffences();
  }

  return res.json(results);
};
