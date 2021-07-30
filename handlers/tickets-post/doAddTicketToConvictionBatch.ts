import type { RequestHandler } from "express";

import { addParkingTicketToConvictionBatch } from "../../helpers/parkingDB/addParkingTicketToConvictionBatch.js";
import { getConvictionBatch } from "../../helpers/parkingDB/getConvictionBatch.js";

import type * as pts from "../../types/recordTypes";


export const handler: RequestHandler = (request, response) => {

  const batchID = request.body.batchID;
  const ticketID = request.body.ticketID;

  const result: {
    success: boolean;
    message?: string;
    batch?: pts.ParkingTicketConvictionBatch;
  } = addParkingTicketToConvictionBatch(
    batchID,
    ticketID,
    request.session
  );

  if (result.success) {
    result.batch = getConvictionBatch(batchID);
  }

  return response.json(result);
};


export default handler;
