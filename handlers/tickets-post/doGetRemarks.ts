import type { RequestHandler } from "express";

import * as parkingDB_getParkingTicketRemarks from "../../helpers/parkingDB/getParkingTicketRemarks";


export const handler: RequestHandler = (req, res) => {
  return res.json(parkingDB_getParkingTicketRemarks.getParkingTicketRemarks(req.body.ticketID, req.session));
};
