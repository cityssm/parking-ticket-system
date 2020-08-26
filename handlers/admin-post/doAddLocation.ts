import type { RequestHandler } from "express";

import * as parkingDB_getParkingLocations from "../../helpers/parkingDB/getParkingLocations";
import * as parkingDB_addParkingLocation from "../../helpers/parkingDB/addParkingLocation";


export const handler: RequestHandler = (req, res) => {

  const results = parkingDB_addParkingLocation.addParkingLocation(req.body);

  if (results.success) {

    results.locations = parkingDB_getParkingLocations.getParkingLocations();
  }

  return res.json(results);
};
