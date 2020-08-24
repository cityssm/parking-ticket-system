import type { RequestHandler } from "express";

import * as parkingDB_getLookupBatch from "../../helpers/parkingDB/getLookupBatch";

import { userCanUpdate, userIsOperator } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!(userCanUpdate(req) || userIsOperator(req))) {
    return res.redirect("/plates/?error=accessDenied");
  }

  const latestUnlockedBatch = parkingDB_getLookupBatch.getLookupBatch(-1);

  res.render("mto-plateExport", {
    headTitle: "MTO Licence Plate Export",
    batch: latestUnlockedBatch
  });
};
