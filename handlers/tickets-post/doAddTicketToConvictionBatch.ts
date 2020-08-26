import type { RequestHandler } from "express";

import * as parkingDB_addParkingTicketToConvictionBatch from "../../helpers/parkingDB/addParkingTicketToConvictionBatch";
import * as parkingDB_getConvictionBatch from "../../helpers/parkingDB/getConvictionBatch";

import type * as pts from "../../types/recordTypes";


export const handler: RequestHandler = (req, res) => {

  const batchID = req.body.batchID;
  const ticketID = req.body.ticketID;

  const result: {
    success: boolean;
    message?: string;
    batch?: pts.ParkingTicketConvictionBatch;
  } = parkingDB_addParkingTicketToConvictionBatch.addParkingTicketToConvictionBatch(
    batchID,
    ticketID,
    req.session
  );

  if (result.success) {
    result.batch = parkingDB_getConvictionBatch.getConvictionBatch(batchID);
  }

  return res.json(result);
};
