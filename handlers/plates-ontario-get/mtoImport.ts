import type { RequestHandler } from "express";

import * as parkingDB_getUnreceivedLookupBatches from "../../helpers/parkingDB/getUnreceivedLookupBatches";

import { userCanUpdate, userIsOperator } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!(userCanUpdate(req) || userIsOperator(req))) {
    return res.redirect("/plates/?error=accessDenied");
  }

  const unreceivedBatches = parkingDB_getUnreceivedLookupBatches.getUnreceivedLookupBatches(false);

  res.render("mto-plateImport", {
    headTitle: "MTO Licence Plate Ownership Import",
    batches: unreceivedBatches
  });
};
