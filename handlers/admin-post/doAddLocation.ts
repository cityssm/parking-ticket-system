import type { RequestHandler } from "express";

import getParkingLocations from "../../helpers/parkingDB/getParkingLocations.js";
import addParkingLocation from "../../helpers/parkingDB/addParkingLocation.js";


export const handler: RequestHandler = (req, res) => {

  const results = addParkingLocation(req.body);

  if (results.success) {

    results.locations = getParkingLocations();
  }

  return res.json(results);
};


export default handler;
