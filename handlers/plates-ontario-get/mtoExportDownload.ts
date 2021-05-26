import type { RequestHandler } from "express";

import * as mtoFns from "../../helpers/mtoFns.js";


export const handler: RequestHandler = (req, res) => {

  const batchID = parseInt(req.params.batchID, 10);

  const output = mtoFns.exportLicencePlateBatch(batchID, req.session);

  res.setHeader("Content-Disposition",
    "attachment; filename=lookupBatch-" + batchID.toString() + ".txt");
  res.setHeader("Content-Type", "text/plain");

  res.send(output);
};


export default handler;
