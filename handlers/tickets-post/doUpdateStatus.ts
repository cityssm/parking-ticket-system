import type { RequestHandler } from "express";

import * as parkingDB_updateParkingTicketStatus from "../../helpers/parkingDB/updateParkingTicketStatus";

import { userCanCreate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_updateParkingTicketStatus.updateParkingTicketStatus(req.body, req.session);

  return res.json(result);
};
