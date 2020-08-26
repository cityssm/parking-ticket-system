import type { RequestHandler } from "express";

import * as parkingDB_updateParkingTicket from "../../helpers/parkingDB/updateParkingTicket";


export const handler: RequestHandler = (req, res) => {

  const result = parkingDB_updateParkingTicket.updateParkingTicket(req.body, req.session);

  return res.json(result);
};
