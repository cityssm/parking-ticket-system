import type { RequestHandler } from "express";

import * as vehicleFns from "../../helpers/vehicleFns.js";


export const handler: RequestHandler = (req, res) => {

  const makeModelList = vehicleFns.getModelsByMakeFromCache(req.body.vehicleMake);
  res.json(makeModelList);
};


export default handler;
