import type { RequestHandler } from "express";

import * as parkingDB_lockConvictionBatch from "../../helpers/parkingDB/lockConvictionBatch";

import { userCanUpdate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const batchID = req.body.batchID;

  const result = parkingDB_lockConvictionBatch.lockConvictionBatch(batchID, req.session);

  return res.json(result);
};
