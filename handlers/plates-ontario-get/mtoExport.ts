import type { RequestHandler } from "express";

import * as parkingDB_getLookupBatch from "../../helpers/parkingDB/getLookupBatch";


export const handler: RequestHandler = (_req, res) => {

  const latestUnlockedBatch = parkingDB_getLookupBatch.getLookupBatch(-1);

  res.render("mto-plateExport", {
    headTitle: "MTO Licence Plate Export",
    batch: latestUnlockedBatch
  });
};
