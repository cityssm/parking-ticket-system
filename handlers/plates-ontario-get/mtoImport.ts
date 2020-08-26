import type { RequestHandler } from "express";

import * as parkingDB_getUnreceivedLookupBatches from "../../helpers/parkingDB/getUnreceivedLookupBatches";


export const handler: RequestHandler = (req, res) => {

  const unreceivedBatches = parkingDB_getUnreceivedLookupBatches.getUnreceivedLookupBatches(false);

  res.render("mto-plateImport", {
    headTitle: "MTO Licence Plate Ownership Import",
    batches: unreceivedBatches
  });
};
