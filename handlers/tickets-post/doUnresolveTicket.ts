import type { RequestHandler } from "express";

import * as parkingDB_unresolveParkingTicket from "../../helpers/parkingDB/unresolveParkingTicket";

import { userCanCreate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_unresolveParkingTicket.unresolveParkingTicket(
    req.body.ticketID,
    req.session
  );

  return res.json(result);
};
