import type { RequestHandler } from "express";

import unlockConvictionBatch from "../../helpers/parkingDB/unlockConvictionBatch.js";


export const handler: RequestHandler = (req, res) => {

  const batchID = req.body.batchID;

  const success = unlockConvictionBatch(batchID, req.session);

  return res.json({ success });
};


export default handler;
