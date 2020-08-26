import type { RequestHandler } from "express";

import * as parkingDB_getParkingLocations from "../../helpers/parkingDB/getParkingLocations";
import * as parkingDB_updateParkingLocation from "../../helpers/parkingDB/updateParkingLocation";


export const handler: RequestHandler = (req, res) => {

  const results = parkingDB_updateParkingLocation.updateParkingLocation(req.body);

  if (results.success) {

    results.locations = parkingDB_getParkingLocations.getParkingLocations();
  }

  return res.json(results);
};
