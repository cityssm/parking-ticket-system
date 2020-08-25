import type { RequestHandler } from "express";

import * as mtoFns from "../../helpers/mtoFns";

import { userCanUpdate, userIsOperator } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!(userCanUpdate(req) || userIsOperator(req))) {
    return res.redirect("/plates/?error=accessDenied");
  }

  const batchID = parseInt(req.params.batchID, 10);

  const output = mtoFns.exportLicencePlateBatch(batchID, req.session);

  res.setHeader("Content-Disposition",
    "attachment; filename=lookupBatch-" + batchID.toString() + ".txt");
  res.setHeader("Content-Type", "text/plain");

  res.send(output);
};
