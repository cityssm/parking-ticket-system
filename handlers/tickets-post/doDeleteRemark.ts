import type { RequestHandler } from "express";

import * as parkingDB_deleteParkingTicketRemark from "../../helpers/parkingDB/deleteParkingTicketRemark";


export const handler: RequestHandler = (req, res) => {

  const result = parkingDB_deleteParkingTicketRemark.deleteParkingTicketRemark(
    req.body.ticketID,
    req.body.remarkIndex,
    req.session
  );

  return res.json(result);
};
