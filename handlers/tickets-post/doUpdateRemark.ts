import type { RequestHandler } from "express";

import updateParkingTicketRemark from "../../helpers/parkingDB/updateParkingTicketRemark.js";


export const handler: RequestHandler = (req, res) => {

  const result = updateParkingTicketRemark(req.body, req.session);

  return res.json(result);
};


export default handler;
