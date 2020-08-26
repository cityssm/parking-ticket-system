import type { RequestHandler } from "express";

import * as parkingDB_unlockConvictionBatch from "../../helpers/parkingDB/unlockConvictionBatch";


export const handler: RequestHandler = (req, res) => {

  const batchID = req.body.batchID;

  const success = parkingDB_unlockConvictionBatch.unlockConvictionBatch(batchID, req.session);

  return res.json({ success });
};
