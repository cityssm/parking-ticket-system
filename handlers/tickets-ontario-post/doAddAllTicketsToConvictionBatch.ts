import type { RequestHandler } from "express";

import * as parkingDB_ontario from "../../helpers/parkingDB-ontario.js";

import { addAllParkingTicketsToConvictionBatch } from "../../helpers/parkingDB/addParkingTicketToConvictionBatch.js";
import getConvictionBatch from "../../helpers/parkingDB/getConvictionBatch.js";

import type * as pts from "../../types/recordTypes";


export const handler: RequestHandler = (req, res) => {

  const batchID = req.body.batchID;
  const ticketIDs: number[] = req.body.ticketIDs;

  const result: {
    successCount?: number;
    message?: string;
    batch?: pts.ParkingTicketConvictionBatch;
    tickets?: pts.ParkingTicket[];
  } = addAllParkingTicketsToConvictionBatch(batchID, ticketIDs, req.session);

  if (result.successCount > 0) {
    result.batch = getConvictionBatch(batchID);
    result.tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
  }

  return res.json(result);
};


export default handler;
