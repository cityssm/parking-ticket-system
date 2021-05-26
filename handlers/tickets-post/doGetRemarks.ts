import type { RequestHandler } from "express";

import getParkingTicketRemarks from "../../helpers/parkingDB/getParkingTicketRemarks.js";


export const handler: RequestHandler = (req, res) => {
  return res.json(getParkingTicketRemarks(req.body.ticketID, req.session));
};


export default handler;
