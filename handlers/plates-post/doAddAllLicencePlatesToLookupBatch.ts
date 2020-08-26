import type { RequestHandler } from "express";

import * as parkingDB_addLicencePlateToLookupBatch from "../../helpers/parkingDB/addLicencePlateToLookupBatch";


export const handler: RequestHandler = (req, res) => {

  const result = parkingDB_addLicencePlateToLookupBatch.addAllLicencePlatesToLookupBatch(req.body, req.session);

  return res.json(result);
};
