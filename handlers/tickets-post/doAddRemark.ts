import type { RequestHandler } from "express";

import * as parkingDB_createParkingTicketRemark from "../../helpers/parkingDB/createParkingTicketRemark";

import { userCanCreate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_createParkingTicketRemark.createParkingTicketRemark(req.body, req.session);

  return res.json(result);
};
