import type { RequestHandler } from "express";

import * as parkingDB_ontario from "../../helpers/parkingDB-ontario.js";

import { addAllParkingTicketsToConvictionBatch } from "../../helpers/parkingDB/addParkingTicketToConvictionBatch.js";
import { getConvictionBatch } from "../../helpers/parkingDB/getConvictionBatch.js";

import type * as pts from "../../types/recordTypes";


export const handler: RequestHandler = (request, response) => {

  const batchID = request.body.batchID;
  const ticketIDs: number[] = request.body.ticketIDs;

  const result: {
    successCount?: number;
    message?: string;
    batch?: pts.ParkingTicketConvictionBatch;
    tickets?: pts.ParkingTicket[];
  } = addAllParkingTicketsToConvictionBatch(batchID, ticketIDs, request.session);

  if (result.successCount > 0) {
    result.batch = getConvictionBatch(batchID);
    result.tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
  }

  return response.json(result);
};


export default handler;
