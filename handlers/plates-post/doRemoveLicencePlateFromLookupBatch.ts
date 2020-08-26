import type { RequestHandler } from "express";

import * as parkingDB_removeLicencePlateFromLookupBatch from "../../helpers/parkingDB/removeLicencePlateFromLookupBatch";


export const handler: RequestHandler = (req, res) => {

  const result = parkingDB_removeLicencePlateFromLookupBatch.removeLicencePlateFromLookupBatch(req.body, req.session);

  return res.json(result);
};
