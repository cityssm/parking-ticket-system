import type { RequestHandler } from "express";

import * as parkingDB_restoreParkingTicket from "../../helpers/parkingDB/restoreParkingTicket";

import { userCanUpdate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_restoreParkingTicket.restoreParkingTicket(req.body.ticketID, req.session);

  return res.json(result);
};
