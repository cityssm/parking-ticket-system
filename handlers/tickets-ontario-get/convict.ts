import type { RequestHandler } from "express";

import * as parkingDB_ontario from "../../helpers/parkingDB-ontario";

import * as parkingDB_getConvictionBatch from "../../helpers/parkingDB/getConvictionBatch";


export const handler: RequestHandler = (_req, res) => {

  const tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();

  const batch = parkingDB_getConvictionBatch.getConvictionBatch(-1);

  res.render("mto-ticketConvict", {
    headTitle: "Convict Parking Tickets",
    tickets,
    batch
  });
};
