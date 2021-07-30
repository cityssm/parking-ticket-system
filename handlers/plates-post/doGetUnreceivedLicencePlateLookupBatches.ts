import type { RequestHandler } from "express";

import { getUnreceivedLookupBatches } from "../../helpers/parkingDB/getUnreceivedLookupBatches.js";


export const handler: RequestHandler = (request, response) => {

  const batches = getUnreceivedLookupBatches(request.session.user.userProperties.canUpdate);
  return response.json(batches);
};


export default handler;
