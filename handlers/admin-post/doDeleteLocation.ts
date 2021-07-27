import type { RequestHandler } from "express";

import { getParkingLocations } from "../../helpers/parkingDB/getParkingLocations.js";
import { deleteParkingLocation } from "../../helpers/parkingDB/deleteParkingLocation.js";


export const handler: RequestHandler = (request, response) => {

  const results = deleteParkingLocation(request.body.locationKey);

  if (results.success) {
    results.locations = getParkingLocations();
  }

  return response.json(results);
};


export default handler;
