import type { RequestHandler } from "express";


import * as parkingDB_getParkingTickets from "../../helpers/parkingDB/getParkingTickets.js";


export const handler: RequestHandler = (req, res) => {

  const queryOptions: parkingDB_getParkingTickets.GetParkingTicketsQueryOptions = {
    limit: parseInt(req.body.limit, 10),
    offset: parseInt(req.body.offset, 10),
    ticketNumber: req.body.ticketNumber,
    licencePlateNumber: req.body.licencePlateNumber,
    location: req.body.location
  };

  if (req.body.isResolved !== "") {
    queryOptions.isResolved = req.body.isResolved === "1";
  }

  res.json(parkingDB_getParkingTickets.getParkingTickets(req.session, queryOptions));
};


export default handler;
