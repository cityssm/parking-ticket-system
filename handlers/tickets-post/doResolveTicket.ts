import type { RequestHandler } from "express";

import * as parkingDB_resolveParkingTicket from "../../helpers/parkingDB/resolveParkingTicket";


export const handler: RequestHandler = (req, res) => {

  const result = parkingDB_resolveParkingTicket.resolveParkingTicket(req.body.ticketID, req.session);

  return res.json(result);
};
