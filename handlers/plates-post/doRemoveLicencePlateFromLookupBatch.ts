import type { RequestHandler } from "express";

import * as parkingDB_removeLicencePlateFromLookupBatch from "../../helpers/parkingDB/removeLicencePlateFromLookupBatch";

import { userCanUpdate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_removeLicencePlateFromLookupBatch.removeLicencePlateFromLookupBatch(req.body, req.session);

  return res.json(result);
};
