import type { RequestHandler } from "express";

import * as parkingDB_getUnreceivedLookupBatches from "../../helpers/parkingDB/getUnreceivedLookupBatches";


export const handler: RequestHandler = (req, res) => {

  const batches = parkingDB_getUnreceivedLookupBatches.getUnreceivedLookupBatches(req.session.user.userProperties.canUpdate);
  return res.json(batches);
};
