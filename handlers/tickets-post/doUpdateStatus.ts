import type { RequestHandler } from "express";

import * as parkingDB_updateParkingTicketStatus from "../../helpers/parkingDB/updateParkingTicketStatus";


export const handler: RequestHandler = (req, res) => {

  const result = parkingDB_updateParkingTicketStatus.updateParkingTicketStatus(req.body, req.session);

  return res.json(result);
};
