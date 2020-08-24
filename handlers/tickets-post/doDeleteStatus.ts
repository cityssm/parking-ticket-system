import type { RequestHandler } from "express";

import * as parkingDB_deleteParkingTicketStatus from "../../helpers/parkingDB/deleteParkingTicketStatus";

import { userCanCreate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_deleteParkingTicketStatus.deleteParkingTicketStatus(
    req.body.ticketID,
    req.body.statusIndex,
    req.session
  );

  return res.json(result);
};
