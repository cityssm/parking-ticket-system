import type { RequestHandler } from "express";

import { getParkingOffences } from "../../helpers/parkingDB/getParkingOffences.js";
import { deleteParkingOffence } from "../../helpers/parkingDB/deleteParkingOffence.js";


export const handler: RequestHandler = (request, response) => {

  const results = deleteParkingOffence(request.body.bylawNumber, request.body.locationKey);

  if (results.success) {
    results.offences = getParkingOffences();
  }

  return response.json(results);
};


export default handler;
