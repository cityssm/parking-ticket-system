import type { RequestHandler } from "express";

import { getLicencePlatesAvailableForMTOLookupBatch } from "../../helpers/parkingDB-ontario.js";


export const handler: RequestHandler = (request, response) => {

  const batchID = Number.parseInt(request.body.batchID, 10);
  const issueDaysAgo = Number.parseInt(request.body.issueDaysAgo, 10);

  const availablePlates = getLicencePlatesAvailableForMTOLookupBatch(batchID, issueDaysAgo);
  return response.json(availablePlates);
};


export default handler;
