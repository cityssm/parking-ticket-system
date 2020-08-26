import type { RequestHandler } from "express";

import * as parkingDB_createConvictionBatch from "../../helpers/parkingDB/createConvictionBatch";


export const handler: RequestHandler = (req, res) => {

  const batchResult = parkingDB_createConvictionBatch.createConvictionBatch(
    req.session
  );

  return res.json(batchResult);
};
