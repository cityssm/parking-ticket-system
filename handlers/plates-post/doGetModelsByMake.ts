import type { RequestHandler } from "express";

import * as vehicleFunctions from "../../helpers/functions.vehicle.js";


export const handler: RequestHandler = (req, res) => {

  const makeModelList = vehicleFunctions.getModelsByMakeFromCache(req.body.vehicleMake);
  res.json(makeModelList);
};


export default handler;
