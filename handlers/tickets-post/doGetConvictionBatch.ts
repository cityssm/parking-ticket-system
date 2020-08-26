import type { RequestHandler } from "express";

import * as parkingDB_getConvictionBatch from "../../helpers/parkingDB/getConvictionBatch";


export const handler: RequestHandler = (req, res) => {

  const batch = parkingDB_getConvictionBatch.getConvictionBatch(
    req.body.batchID
  );

  return res.json(batch);
};
