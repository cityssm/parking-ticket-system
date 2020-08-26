import type { RequestHandler } from "express";

import * as parkingDB_getLookupBatch from "../../helpers/parkingDB/getLookupBatch";


export const handler: RequestHandler = (req, res) => {

  const batch = parkingDB_getLookupBatch.getLookupBatch(req.body.batchID);

  return res.json(batch);
};
