import type { RequestHandler } from "express";

import restoreParkingTicket from "../../helpers/parkingDB/restoreParkingTicket.js";


export const handler: RequestHandler = (req, res) => {

  const result = restoreParkingTicket(req.body.ticketID, req.session);

  return res.json(result);
};


export default handler;
