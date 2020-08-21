import type { RequestHandler } from "express";

import * as parkingDB_unlockConvictionBatch from "../../helpers/parkingDB/unlockConvictionBatch";

import { userCanUpdate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const batchID = req.body.batchID;

  const success = parkingDB_unlockConvictionBatch.unlockConvictionBatch(batchID, req.session);

  return res.json({ success });
};
