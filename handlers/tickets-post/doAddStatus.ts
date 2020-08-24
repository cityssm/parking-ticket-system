import type { RequestHandler } from "express";

import * as parkingDB_createParkingTicketStatus from "../../helpers/parkingDB/createParkingTicketStatus";

import { userCanCreate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_createParkingTicketStatus.createParkingTicketStatus(
    req.body,
    req.session,
    req.body.resolveTicket === "1"
  );

  return res.json(result);
};
