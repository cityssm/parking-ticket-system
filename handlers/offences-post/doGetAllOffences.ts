import type { RequestHandler } from "express";

import { getParkingOffences } from "../../helpers/parkingDB/getParkingOffences.js";


export const handler: RequestHandler = (_request, response) => {
  response.json(getParkingOffences());
};


export default handler;
