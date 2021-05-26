import type { RequestHandler } from "express";

import getLastTenConvictionBatches from "../../helpers/parkingDB/getLastTenConvictionBatches.js";


export const handler: RequestHandler = (_req, res) => {

  const batches = getLastTenConvictionBatches();

  return res.json(batches);
};


export default handler;
