import type { RequestHandler } from "express";

import * as parkingDB_ontario from "../../helpers/parkingDB-ontario";

import * as parkingDB_getConvictionBatch from "../../helpers/parkingDB/getConvictionBatch";

import { userCanUpdate, userIsOperator } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!(userCanUpdate(req) || userIsOperator(req))) {

    res.redirect("/tickets/?error=accessDenied");
    return;

  }

  const tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();

  const batch = parkingDB_getConvictionBatch.getConvictionBatch(-1);

  res.render("mto-ticketConvict", {
    headTitle: "Convict Parking Tickets",
    tickets,
    batch
  });
};
