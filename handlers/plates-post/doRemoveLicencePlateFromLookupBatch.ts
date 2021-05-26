import type { RequestHandler } from "express";

import removeLicencePlateFromLookupBatch from "../../helpers/parkingDB/removeLicencePlateFromLookupBatch.js";


export const handler: RequestHandler = (req, res) => {

  const result = removeLicencePlateFromLookupBatch(req.body, req.session);

  return res.json(result);
};


export default handler;
