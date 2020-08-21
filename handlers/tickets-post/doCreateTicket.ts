import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";

import * as parkingDB_createParkingTicket from "../../helpers/parkingDB/createParkingTicket";

import { userCanCreate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_createParkingTicket.createParkingTicket(req.body, req.session);

  if (result.success) {
    const ticketNumber = req.body.ticketNumber;
    result.nextTicketNumber = configFns.getProperty(
      "parkingTickets.ticketNumber.nextTicketNumberFn"
    )(ticketNumber);
  }

  return res.json(result);
};
