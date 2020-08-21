import type { RequestHandler } from "express";

import * as parkingDB_updateParkingTicket from "../../helpers/parkingDB/updateParkingTicket";

import { userCanCreate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_updateParkingTicket.updateParkingTicket(req.body, req.session);

  return res.json(result);
};
