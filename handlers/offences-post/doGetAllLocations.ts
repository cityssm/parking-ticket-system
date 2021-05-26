import type { RequestHandler } from "express";

import getParkingLocations from "../../helpers/parkingDB/getParkingLocations.js";


export const handler: RequestHandler = (_req, res) => {
  res.json(getParkingLocations());
};


export default handler;
