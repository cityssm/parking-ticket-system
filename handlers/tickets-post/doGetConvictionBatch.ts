import type { RequestHandler } from "express";

import * as parkingDB_getConvictionBatch from "../../helpers/parkingDB/getConvictionBatch";

import { userCanUpdate, userIsOperator, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!(userCanUpdate(req) || userIsOperator(req))) {
    return forbiddenJSON(res);
  }

  const batch = parkingDB_getConvictionBatch.getConvictionBatch(
    req.body.batchID
  );

  return res.json(batch);
};
