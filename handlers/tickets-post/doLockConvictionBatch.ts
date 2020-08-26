import type { RequestHandler } from "express";

import * as parkingDB_lockConvictionBatch from "../../helpers/parkingDB/lockConvictionBatch";


export const handler: RequestHandler = (req, res) => {

  const batchID = req.body.batchID;

  const result = parkingDB_lockConvictionBatch.lockConvictionBatch(batchID, req.session);

  return res.json(result);
};
