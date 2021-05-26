import type { RequestHandler } from "express";

import getParkingTicketID from "../../helpers/parkingDB/getParkingTicketID.js";


export const handler: RequestHandler = (req, res) => {

  const ticketNumber = req.params.ticketNumber;

  const ticketID = getParkingTicketID(ticketNumber);

  if (ticketID) {
    res.redirect("/tickets/" + ticketID.toString());
  } else {
    res.redirect("/tickets/?error=ticketNotFound");
  }
};


export default handler;
