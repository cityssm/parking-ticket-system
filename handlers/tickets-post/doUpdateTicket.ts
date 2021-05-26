import type { RequestHandler } from "express";

import updateParkingTicket from "../../helpers/parkingDB/updateParkingTicket.js";


export const handler: RequestHandler = (req, res) => {

  const result = updateParkingTicket(req.body, req.session);

  return res.json(result);
};


export default handler;
