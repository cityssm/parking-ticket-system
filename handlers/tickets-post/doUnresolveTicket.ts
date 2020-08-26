import type { RequestHandler } from "express";

import * as parkingDB_unresolveParkingTicket from "../../helpers/parkingDB/unresolveParkingTicket";


export const handler: RequestHandler = (req, res) => {

  const result = parkingDB_unresolveParkingTicket.unresolveParkingTicket(
    req.body.ticketID,
    req.session
  );

  return res.json(result);
};
