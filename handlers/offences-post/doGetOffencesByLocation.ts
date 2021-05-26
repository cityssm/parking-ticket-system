import type { RequestHandler } from "express";

import { getParkingOffencesByLocationKey } from "../../helpers/parkingDB/getParkingOffences.js";


export const handler: RequestHandler = (req, res) => {
  res.json(getParkingOffencesByLocationKey(req.body.locationKey));
};


export default handler;
