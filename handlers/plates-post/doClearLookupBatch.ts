import type { RequestHandler } from "express";

import * as parkingDB_getLookupBatch from "../../helpers/parkingDB/getLookupBatch";
import * as parkingDB_clearLookupBatch from "../../helpers/parkingDB/clearLookupBatch";

import { userCanUpdate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const batchID = parseInt(req.body.batchID, 10);

  const result = parkingDB_clearLookupBatch.clearLookupBatch(batchID, req.session);

  if (result.success) {
    result.batch = parkingDB_getLookupBatch.getLookupBatch(batchID);
  }

  return res.json(result);
};
