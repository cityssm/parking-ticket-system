import type { RequestHandler } from "express";

import * as parkingDB_ontario from "../../helpers/parkingDB-ontario";


export const handler: RequestHandler = (req, res) => {

  const batchID = parseInt(req.body.batchID, 10);
  const issueDaysAgo = parseInt(req.body.issueDaysAgo, 10);

  const availablePlates = parkingDB_ontario.getLicencePlatesAvailableForMTOLookupBatch(batchID, issueDaysAgo);
  return res.json(availablePlates);
};
