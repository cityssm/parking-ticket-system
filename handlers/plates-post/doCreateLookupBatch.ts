import type { RequestHandler } from "express";

import createLookupBatch from "../../helpers/parkingDB/createLookupBatch.js";


export const handler: RequestHandler = (req, res) => {

  const createBatchResponse = createLookupBatch(req.session);

  return res.json(createBatchResponse);
};


export default handler;
