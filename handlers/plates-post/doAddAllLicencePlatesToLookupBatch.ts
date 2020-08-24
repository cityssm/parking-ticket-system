import type { RequestHandler } from "express";

import * as parkingDB_addLicencePlateToLookupBatch from "../../helpers/parkingDB/addLicencePlateToLookupBatch";

import { userCanUpdate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_addLicencePlateToLookupBatch.addAllLicencePlatesToLookupBatch(req.body, req.session);

  return res.json(result);
};
