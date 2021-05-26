import type { RequestHandler } from "express";

import getLookupBatch from "../../helpers/parkingDB/getLookupBatch.js";


export const handler: RequestHandler = (req, res) => {

  const batch = getLookupBatch(req.body.batchID);

  return res.json(batch);
};


export default handler;
