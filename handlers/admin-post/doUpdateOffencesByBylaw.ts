import type { RequestHandler } from "express";

import * as parkingDB_getParkingBylaws from "../../helpers/parkingDB/getParkingBylaws";
import * as parkingDB_updateParkingOffencesByBylawNumber from "../../helpers/parkingDB/updateParkingOffencesByBylawNumber";

import { userIsAdmin, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userIsAdmin(req)) {
    return forbiddenJSON(res);
  }

  const results = parkingDB_updateParkingOffencesByBylawNumber.updateParkingOffencesByBylawNumber(req.body);

  if (results.success) {

    results.bylaws = parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats();

  }

  return res.json(results);
};
