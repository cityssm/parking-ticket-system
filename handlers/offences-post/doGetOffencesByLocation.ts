import type { RequestHandler } from "express";

import * as parkingDB_getParkingOffences from "../../helpers/parkingDB/getParkingOffences";


export const handler: RequestHandler = (req, res) => {
  res.json(parkingDB_getParkingOffences.getParkingOffencesByLocationKey(req.body.locationKey));
};
