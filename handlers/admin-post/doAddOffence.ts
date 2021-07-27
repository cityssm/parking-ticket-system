import type { RequestHandler } from "express";

import { getParkingOffences } from "../../helpers/parkingDB/getParkingOffences.js";
import { addParkingOffence } from "../../helpers/parkingDB/addParkingOffence.js";


export const handler: RequestHandler = (request, response) => {

  const results = addParkingOffence(request.body);

  if (results.success && request.body.returnOffences) {
    results.offences = getParkingOffences();
  }

  response.json(results);
};


export default handler;
