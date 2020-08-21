import type { RequestHandler } from "express";

import * as parkingDB_getLastTenConvictionBatches from "../../helpers/parkingDB/getLastTenConvictionBatches";

import { userCanUpdate, userIsOperator, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!(userCanUpdate(req) || userIsOperator(req))) {
    return forbiddenJSON(res);
  }

  const batches = parkingDB_getLastTenConvictionBatches.getLastTenConvictionBatches();

  return res.json(batches);
};
