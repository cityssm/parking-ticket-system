import type { RequestHandler } from "express";

import * as parkingDB_ontario from "../../helpers/parkingDB-ontario.js";

import removeParkingTicketFromConvictionBatch from "../../helpers/parkingDB/removeParkingTicketFromConvictionBatch.js";

import type * as pts from "../../types/recordTypes";


export const handler: RequestHandler = (req, res) => {

  const batchID = req.body.batchID;
  const ticketID = req.body.ticketID;

  const result: {
    success: boolean;
    message?: string;
    tickets?: pts.ParkingTicket[];
  } = removeParkingTicketFromConvictionBatch(batchID, ticketID, req.session);

  if (result.success) {
    result.tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
  }

  return res.json(result);
};


export default handler;
