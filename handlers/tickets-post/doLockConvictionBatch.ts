import type { RequestHandler } from "express";

import lockConvictionBatch from "../../helpers/parkingDB/lockConvictionBatch.js";


export const handler: RequestHandler = (req, res) => {

  const batchID = req.body.batchID;

  const result = lockConvictionBatch(batchID, req.session);

  return res.json(result);
};


export default handler;
