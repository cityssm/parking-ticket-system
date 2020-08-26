import type { RequestHandler } from "express";

import * as parkingDB_updateParkingTicketRemark from "../../helpers/parkingDB/updateParkingTicketRemark";


export const handler: RequestHandler = (req, res) => {

  const result = parkingDB_updateParkingTicketRemark.updateParkingTicketRemark(req.body, req.session);

  return res.json(result);
};
