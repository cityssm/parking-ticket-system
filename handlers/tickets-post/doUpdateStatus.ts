import type { RequestHandler } from "express";

import updateParkingTicketStatus from "../../helpers/parkingDB/updateParkingTicketStatus.js";


export const handler: RequestHandler = (req, res) => {

  const result = updateParkingTicketStatus(req.body, req.session);

  return res.json(result);
};


export default handler;
