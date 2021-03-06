import type { RequestHandler } from "express";

import * as parkingDB_getParkingLocations from "../../helpers/parkingDB/getParkingLocations";
import * as parkingDB_deleteParkingLocation from "../../helpers/parkingDB/deleteParkingLocation";


export const handler: RequestHandler = (req, res) => {

  const results = parkingDB_deleteParkingLocation.deleteParkingLocation(req.body.locationKey);

  if (results.success) {

    results.locations = parkingDB_getParkingLocations.getParkingLocations();
  }

  return res.json(results);
};
