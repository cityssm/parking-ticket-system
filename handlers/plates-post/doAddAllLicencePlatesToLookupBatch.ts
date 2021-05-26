import type { RequestHandler } from "express";

import { addAllLicencePlatesToLookupBatch } from "../../helpers/parkingDB/addLicencePlateToLookupBatch.js";


export const handler: RequestHandler = (req, res) => {

  const result = addAllLicencePlatesToLookupBatch(req.body, req.session);

  return res.json(result);
};


export default handler;
