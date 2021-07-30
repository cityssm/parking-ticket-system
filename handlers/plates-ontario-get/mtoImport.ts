import type { RequestHandler } from "express";

import { getUnreceivedLookupBatches } from "../../helpers/parkingDB/getUnreceivedLookupBatches.js";


export const handler: RequestHandler = (_request, response) => {

  const unreceivedBatches = getUnreceivedLookupBatches(false);

  response.render("mto-plateImport", {
    headTitle: "MTO Licence Plate Ownership Import",
    batches: unreceivedBatches
  });
};


export default handler;
