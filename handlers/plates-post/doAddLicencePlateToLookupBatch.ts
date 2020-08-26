import type { RequestHandler } from "express";

import * as parkingDB_getLookupBatch from "../../helpers/parkingDB/getLookupBatch";
import * as parkingDB_addLicencePlateToLookupBatch from "../../helpers/parkingDB/addLicencePlateToLookupBatch";


export const handler: RequestHandler = (req, res) => {

  const result = parkingDB_addLicencePlateToLookupBatch.addLicencePlateToLookupBatch(req.body, req.session);

  if (result.success) {
    result.batch = parkingDB_getLookupBatch.getLookupBatch(req.body.batchID);
  }

  return res.json(result);
};
