import type { RequestHandler } from "express";

import * as parkingDB_ontario from "../../helpers/parkingDB-ontario.js";

import clearConvictionBatch from "../../helpers/parkingDB/clearConvictionBatch.js";
import getConvictionBatch from "../../helpers/parkingDB/getConvictionBatch.js";

import type * as pts from "../../types/recordTypes";


export const handler: RequestHandler = (req, res) => {

  const batchID = req.body.batchID;

  const result: {
    success: boolean;
    message?: string;
    batch?: pts.ParkingTicketConvictionBatch;
    tickets?: pts.ParkingTicket[];
  } = clearConvictionBatch(batchID, req.session);

  if (result.success) {
    result.batch = getConvictionBatch(batchID);
    result.tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
  }

  return res.json(result);
};


export default handler;
