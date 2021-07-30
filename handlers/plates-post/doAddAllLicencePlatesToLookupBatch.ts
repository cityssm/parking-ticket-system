import type { RequestHandler } from "express";

import { addAllLicencePlatesToLookupBatch } from "../../helpers/parkingDB/addLicencePlateToLookupBatch.js";


export const handler: RequestHandler = (request, response) => {

  const result = addAllLicencePlatesToLookupBatch(request.body, request.session);

  return response.json(result);
};


export default handler;
