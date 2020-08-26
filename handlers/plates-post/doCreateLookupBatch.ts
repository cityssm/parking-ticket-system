import type { RequestHandler } from "express";

import * as parkingDB_createLookupBatch from "../../helpers/parkingDB/createLookupBatch";


export const handler: RequestHandler = (req, res) => {

  const createBatchResponse = parkingDB_createLookupBatch.createLookupBatch(req.session);

  return res.json(createBatchResponse);
};
