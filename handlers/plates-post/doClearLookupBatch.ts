import type { RequestHandler } from "express";

import getLookupBatch from "../../helpers/parkingDB/getLookupBatch.js";
import clearLookupBatch from "../../helpers/parkingDB/clearLookupBatch.js";


export const handler: RequestHandler = (req, res) => {

  const batchID = parseInt(req.body.batchID, 10);

  const result = clearLookupBatch(batchID, req.session);

  if (result.success) {
    result.batch = getLookupBatch(batchID);
  }

  return res.json(result);
};


export default handler;
