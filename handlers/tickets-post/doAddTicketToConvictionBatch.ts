import type { RequestHandler } from "express";

import * as parkingDB_addParkingTicketToConvictionBatch from "../../helpers/parkingDB/addParkingTicketToConvictionBatch";
import * as parkingDB_getConvictionBatch from "../../helpers/parkingDB/getConvictionBatch";

import { userCanUpdate, forbiddenJSON } from "../../helpers/userFns";

import type * as pts from "../../helpers/ptsTypes";


export const handler: RequestHandler = (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

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
