import type { RequestHandler } from "express";

import * as parkingDB_getUnreceivedLookupBatches from "../../helpers/parkingDB/getUnreceivedLookupBatches";

import { userCanUpdate, userIsOperator, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!(userCanUpdate(req) || userIsOperator(req))) {
    return forbiddenJSON(res);
  }

  const batches = parkingDB_getUnreceivedLookupBatches.getUnreceivedLookupBatches(req.session.user.userProperties.canUpdate);
  return res.json(batches);
};
