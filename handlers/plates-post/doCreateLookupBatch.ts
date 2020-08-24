import type { RequestHandler } from "express";

import * as parkingDB_createLookupBatch from "../../helpers/parkingDB/createLookupBatch";

import { userCanUpdate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const createBatchResponse = parkingDB_createLookupBatch.createLookupBatch(req.session);

  return res.json(createBatchResponse);
};
