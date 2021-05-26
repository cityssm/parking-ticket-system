import type { RequestHandler } from "express";

import getUnreceivedLookupBatches from "../../helpers/parkingDB/getUnreceivedLookupBatches.js";


export const handler: RequestHandler = (req, res) => {

  const batches = getUnreceivedLookupBatches(req.session.user.userProperties.canUpdate);
  return res.json(batches);
};


export default handler;
