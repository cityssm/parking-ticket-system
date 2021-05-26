import type { RequestHandler } from "express";

import getParkingOffences from "../../helpers/parkingDB/getParkingOffences.js";


export const handler: RequestHandler = (_req, res) => {
  res.json(getParkingOffences());
};


export default handler;
