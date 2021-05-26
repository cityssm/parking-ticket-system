import type { RequestHandler } from "express";

import addParkingTicketToConvictionBatch from "../../helpers/parkingDB/addParkingTicketToConvictionBatch.js";
import getConvictionBatch from "../../helpers/parkingDB/getConvictionBatch.js";

import type * as pts from "../../types/recordTypes";


export const handler: RequestHandler = (req, res) => {

  const batchID = req.body.batchID;
  const ticketID = req.body.ticketID;

  const result: {
    success: boolean;
    message?: string;
    batch?: pts.ParkingTicketConvictionBatch;
  } = addParkingTicketToConvictionBatch(
    batchID,
    ticketID,
    req.session
  );

  if (result.success) {
    result.batch = getConvictionBatch(batchID);
  }

  return res.json(result);
};
