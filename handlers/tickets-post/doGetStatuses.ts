import type { RequestHandler } from "express";

import getParkingTicketStatuses from "../../helpers/parkingDB/getParkingTicketStatuses.js";


export const handler: RequestHandler = (req, res) => {
  return res.json(getParkingTicketStatuses(req.body.ticketID, req.session));
};


export default handler;
