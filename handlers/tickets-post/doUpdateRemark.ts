import type { RequestHandler } from "express";

import * as parkingDB_updateParkingTicketRemark from "../../helpers/parkingDB/updateParkingTicketRemark";

import { userCanCreate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_updateParkingTicketRemark.updateParkingTicketRemark(req.body, req.session);

  return res.json(result);
};
