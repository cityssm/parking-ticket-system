import type { RequestHandler } from "express";

import { getParkingOffences } from "../../helpers/parkingDB/getParkingOffences.js";
import { updateParkingOffence } from "../../helpers/parkingDB/updateParkingOffence.js";


export const handler: RequestHandler = (request, response) => {

  const results = updateParkingOffence(request.body);

  if (results.success) {
    results.offences = getParkingOffences();
  }

  return response.json(results);
};


export default handler;
