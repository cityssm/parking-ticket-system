import type { RequestHandler } from "express";

import * as parkingDB_getParkingOffences from "../../helpers/parkingDB/getParkingOffences";
import * as parkingDB_updateParkingOffence from "../../helpers/parkingDB/updateParkingOffence";


export const handler: RequestHandler = (req, res) => {

  const results = parkingDB_updateParkingOffence.updateParkingOffence(req.body);

  if (results.success) {

    results.offences = parkingDB_getParkingOffences.getParkingOffences();
  }

  return res.json(results);
};
