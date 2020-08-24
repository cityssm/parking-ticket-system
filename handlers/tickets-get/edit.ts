import type { RequestHandler } from "express";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import * as parkingDB_getParkingTicket from "../../helpers/parkingDB/getParkingTicket";
import * as parkingDB from "../../helpers/parkingDB";

import { userCanCreate } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {
  const ticketID = parseInt(req.params.ticketID, 10);

  if (!userCanCreate(req)) {
    return res.redirect("/tickets/" + ticketID.toString());
  }

  const ticket = parkingDB_getParkingTicket.getParkingTicket(ticketID, req.session);

  if (!ticket) {
    return res.redirect("/tickets/?error=ticketNotFound");

  } else if (!ticket.canUpdate || ticket.resolvedDate || ticket.recordDelete_timeMillis) {
    return res.redirect("/tickets/" + ticketID.toString() + "/?error=accessDenied");
  }

  const vehicleMakeModelDatalist = parkingDB.getRecentParkingTicketVehicleMakeModelValues();

  return res.render("ticket-edit", {
    headTitle: "Ticket " + ticket.ticketNumber,
    isCreate: false,
    ticket,
    issueDateMaxString: dateTimeFns.dateToString(new Date()),
    vehicleMakeModelDatalist
  });
};
