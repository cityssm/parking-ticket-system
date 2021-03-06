import type { RequestHandler } from "express";

import * as parkingDB_ontario from "../../helpers/parkingDB-ontario";

import * as parkingDB_clearConvictionBatch from "../../helpers/parkingDB/clearConvictionBatch";
import * as parkingDB_getConvictionBatch from "../../helpers/parkingDB/getConvictionBatch";

import type * as pts from "../../types/recordTypes";


export const handler: RequestHandler = (req, res) => {

  const batchID = req.body.batchID;

  const result: {
    success: boolean;
    message?: string;
    batch?: pts.ParkingTicketConvictionBatch;
    tickets?: pts.ParkingTicket[];
  } = parkingDB_clearConvictionBatch.clearConvictionBatch(batchID, req.session);

  if (result.success) {
    result.batch = parkingDB_getConvictionBatch.getConvictionBatch(batchID);
    result.tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
  }

  return res.json(result);
};
