import type { RequestHandler } from "express";

import { getParkingOffencesByLocationKey } from "../../helpers/parkingDB/getParkingOffences.js";


export const handler: RequestHandler = (request, response) => {
  response.json(getParkingOffencesByLocationKey(request.body.locationKey));
};


export default handler;
