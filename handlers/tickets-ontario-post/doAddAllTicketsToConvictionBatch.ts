import type { RequestHandler } from "express";

import * as parkingDB_ontario from "../../helpers/parkingDB-ontario";

import * as parkingDB_addParkingTicketToConvictionBatch from "../../helpers/parkingDB/addParkingTicketToConvictionBatch";
import * as parkingDB_getConvictionBatch from "../../helpers/parkingDB/getConvictionBatch";

import type * as pts from "../../types/recordTypes";


export const handler: RequestHandler = (req, res) => {

  const batchID = req.body.batchID;
  const ticketIDs: number[] = req.body.ticketIDs;

  const result: {
    successCount?: number;
    message?: string;
    batch?: pts.ParkingTicketConvictionBatch;
    tickets?: pts.ParkingTicket[];
  } = parkingDB_addParkingTicketToConvictionBatch.addAllParkingTicketsToConvictionBatch(batchID, ticketIDs, req.session);

  if (result.successCount > 0) {
    result.batch = parkingDB_getConvictionBatch.getConvictionBatch(batchID);
    result.tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
  }

  return res.json(result);
};
