import type { RequestHandler } from "express";

import { getParkingBylawsWithOffenceStats } from "../../helpers/parkingDB/getParkingBylaws.js";
import { updateParkingBylaw } from "../../helpers/parkingDB/updateParkingBylaw.js";


export const handler: RequestHandler = (request, response) => {

  const results = updateParkingBylaw(request.body);

  if (results.success) {

    results.bylaws = getParkingBylawsWithOffenceStats();
  }

  return response.json(results);
};


export default handler;
