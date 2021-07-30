import type { RequestHandler } from "express";

import { removeLicencePlateFromLookupBatch } from "../../helpers/parkingDB/removeLicencePlateFromLookupBatch.js";


export const handler: RequestHandler = (request, response) => {

  const result = removeLicencePlateFromLookupBatch(request.body, request.session);

  return response.json(result);
};


export default handler;
