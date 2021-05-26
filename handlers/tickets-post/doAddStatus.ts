import type { RequestHandler } from "express";

import createParkingTicketStatus from "../../helpers/parkingDB/createParkingTicketStatus.js";


export const handler: RequestHandler = (req, res) => {

  const result = createParkingTicketStatus(
    req.body,
    req.session,
    req.body.resolveTicket === "1"
  );

  return res.json(result);
};


export default handler;
