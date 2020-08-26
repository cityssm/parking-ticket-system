import type { RequestHandler } from "express";

import * as parkingDB_getLastTenConvictionBatches from "../../helpers/parkingDB/getLastTenConvictionBatches";


export const handler: RequestHandler = (_req, res) => {

  const batches = parkingDB_getLastTenConvictionBatches.getLastTenConvictionBatches();

  return res.json(batches);
};
