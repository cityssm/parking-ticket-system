import type { RequestHandler } from "express";

import * as parkingDB_getParkingTicketStatuses from "../../helpers/parkingDB/getParkingTicketStatuses";


export const handler: RequestHandler = (req, res) => {
  return res.json(parkingDB_getParkingTicketStatuses.getParkingTicketStatuses(req.body.ticketID, req.session));
};
