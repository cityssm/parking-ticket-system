import type { RequestHandler } from "express";

import * as parkingDB_getParkingOffences from "../../helpers/parkingDB/getParkingOffences";
import * as parkingDB_addParkingOffence from "../../helpers/parkingDB/addParkingOffence";

import { userIsAdmin, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userIsAdmin(req)) {
    return forbiddenJSON(res);
  }

  const results = parkingDB_addParkingOffence.addParkingOffence(req.body);

  if (results.success && req.body.returnOffences) {

    results.offences = parkingDB_getParkingOffences.getParkingOffences();
  }

  res.json(results);
};
