import type { RequestHandler } from "express";

import getParkingLocations from "../../helpers/parkingDB/getParkingLocations.js";
import deleteParkingLocation from "../../helpers/parkingDB/deleteParkingLocation.js";


export const handler: RequestHandler = (req, res) => {

  const results = deleteParkingLocation(req.body.locationKey);

  if (results.success) {

    results.locations = getParkingLocations();
  }

  return res.json(results);
};


export default handler;
