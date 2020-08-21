import type { RequestHandler } from "express";

import * as parkingDB_createConvictionBatch from "../../helpers/parkingDB/createConvictionBatch";

import { userCanUpdate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const batchResult = parkingDB_createConvictionBatch.createConvictionBatch(
    req.session
  );

  return res.json(batchResult);
};
