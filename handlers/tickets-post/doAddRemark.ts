import type { RequestHandler } from "express";

import * as parkingDB_createParkingTicketRemark from "../../helpers/parkingDB/createParkingTicketRemark";


export const handler: RequestHandler = (req, res) => {

  const result = parkingDB_createParkingTicketRemark.createParkingTicketRemark(req.body, req.session);

  return res.json(result);
};
