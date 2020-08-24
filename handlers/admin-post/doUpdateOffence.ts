import type { RequestHandler } from "express";

import * as parkingDB_getParkingOffences from "../../helpers/parkingDB/getParkingOffences";
import * as parkingDB_updateParkingOffence from "../../helpers/parkingDB/updateParkingOffence";

import { userIsAdmin, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userIsAdmin(req)) {
    return forbiddenJSON(res);
  }

  const results = parkingDB_updateParkingOffence.updateParkingOffence(req.body);

  if (results.success) {

    results.offences = parkingDB_getParkingOffences.getParkingOffences();
  }

  return res.json(results);
};
