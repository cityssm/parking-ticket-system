import type { RequestHandler } from "express";

import getParkingTicket from "../../helpers/parkingDB/getParkingTicket.js";


export const handler: RequestHandler = (req, res) => {

  const ticketID = parseInt(req.params.ticketID, 10);

  const ticket = getParkingTicket(ticketID, req.session);

  if (!ticket) {
    return res.redirect("/tickets/?error=ticketNotFound");

  } else if (ticket.recordDelete_timeMillis && !req.session.user.userProperties.isAdmin) {
    return res.redirect("/tickets/?error=accessDenied");
  }

  return res.render("ticket-view", {
    headTitle: "Ticket " + ticket.ticketNumber,
    ticket
  });
};


export default handler;
