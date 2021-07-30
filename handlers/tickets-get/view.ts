import type { RequestHandler } from "express";

import {getParkingTicket} from "../../helpers/parkingDB/getParkingTicket.js";


export const handler: RequestHandler = (request, response) => {

  const ticketID = Number.parseInt(request.params.ticketID, 10);

  const ticket = getParkingTicket(ticketID, request.session);

  if (!ticket) {
    return response.redirect("/tickets/?error=ticketNotFound");

  } else if (ticket.recordDelete_timeMillis && !request.session.user.userProperties.isAdmin) {
    return response.redirect("/tickets/?error=accessDenied");
  }

  return response.render("ticket-view", {
    headTitle: "Ticket " + ticket.ticketNumber,
    ticket
  });
};


export default handler;
