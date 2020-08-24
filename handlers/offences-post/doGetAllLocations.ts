import type { RequestHandler } from "express";

import * as parkingDB_getParkingLocations from "../../helpers/parkingDB/getParkingLocations";


export const handler: RequestHandler = (_req, res) => {
  res.json(parkingDB_getParkingLocations.getParkingLocations());
};
