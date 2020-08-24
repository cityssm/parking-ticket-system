import type { RequestHandler } from "express";

import * as parkingDB_getParkingTicketID from "../../helpers/parkingDB/getParkingTicketID";


export const handler: RequestHandler = (req, res) => {

  const ticketNumber = req.params.ticketNumber;

  const ticketID = parkingDB_getParkingTicketID.getParkingTicketID(ticketNumber);

  if (ticketID) {
    res.redirect("/tickets/" + ticketID.toString());
  } else {
    res.redirect("/tickets/?error=ticketNotFound");
  }
};
