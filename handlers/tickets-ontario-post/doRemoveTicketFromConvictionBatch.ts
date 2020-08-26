import type { RequestHandler } from "express";

import * as parkingDB_ontario from "../../helpers/parkingDB-ontario";

import * as parkingDB_removeParkingTicketFromConvictionBatch from "../../helpers/parkingDB/removeParkingTicketFromConvictionBatch";

import type * as pts from "../../types/recordTypes";


export const handler: RequestHandler = (req, res) => {

  const batchID = req.body.batchID;
  const ticketID = req.body.ticketID;

  const result: {
    success: boolean;
    message?: string;
    tickets?: pts.ParkingTicket[];
  } = parkingDB_removeParkingTicketFromConvictionBatch.removeParkingTicketFromConvictionBatch(batchID, ticketID, req.session);

  if (result.success) {
    result.tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
  }

  return res.json(result);
};
