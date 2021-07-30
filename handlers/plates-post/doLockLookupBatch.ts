import type { RequestHandler } from "express";

import { getLookupBatch } from "../../helpers/parkingDB/getLookupBatch.js";
import { lockLookupBatch } from "../../helpers/parkingDB/lockLookupBatch.js";


export const handler: RequestHandler = (request, response) => {

  const batchID = Number.parseInt(request.body.batchID, 10);

  const result = lockLookupBatch(batchID, request.session);

  if (result.success) {
    result.batch = getLookupBatch(batchID);
  }

  return response.json(result);
};


export default handler;
