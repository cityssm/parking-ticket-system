import type { RequestHandler } from "express";

import * as parkingDB_ontario from "../../helpers/parkingDB-ontario.js";

import { removeParkingTicketFromConvictionBatch } from "../../helpers/parkingDB/removeParkingTicketFromConvictionBatch.js";

import type * as pts from "../../types/recordTypes";


export const handler: RequestHandler = (request, response) => {

  const batchID = request.body.batchID;
  const ticketID = request.body.ticketID;

  const result: {
    success: boolean;
    message?: string;
    tickets?: pts.ParkingTicket[];
  } = removeParkingTicketFromConvictionBatch(batchID, ticketID, request.session);

  if (result.success) {
    result.tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
  }

  return response.json(result);
};


export default handler;
