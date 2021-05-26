import type { RequestHandler } from "express";

import getConvictionBatch from "../../helpers/parkingDB/getConvictionBatch.js";


export const handler: RequestHandler = (req, res) => {

  const batch = getConvictionBatch(
    req.body.batchID
  );

  return res.json(batch);
};


export default handler;
