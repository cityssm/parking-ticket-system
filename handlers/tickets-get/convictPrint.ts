import type { RequestHandler } from "express";

import { markConvictionBatchAsSent } from "../../helpers/parkingDB/markConvictionBatchAsSent.js";
import { getConvictionBatch } from "../../helpers/parkingDB/getConvictionBatch.js";


export const handler: RequestHandler = (request, response) => {

  const batchID = Number.parseInt(request.params.batchID, 10);

  const batch = getConvictionBatch(batchID);

  if (!batch.sentDate) {
    markConvictionBatchAsSent(batchID, request.session);
  }

  response.render("ticketConvict-print", {
    headTitle: "Parking Tickets Conviction Batch",
    batch
  });
};


export default handler;
