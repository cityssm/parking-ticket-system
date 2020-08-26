import type { RequestHandler } from "express";

import * as parkingDB_restoreParkingTicket from "../../helpers/parkingDB/restoreParkingTicket";


export const handler: RequestHandler = (req, res) => {

  const result = parkingDB_restoreParkingTicket.restoreParkingTicket(req.body.ticketID, req.session);

  return res.json(result);
};
