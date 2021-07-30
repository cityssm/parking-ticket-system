import type { RequestHandler } from "express";

import { getParkingTicketStatuses } from "../../helpers/parkingDB/getParkingTicketStatuses.js";


export const handler: RequestHandler = (request, response) => {
  return response.json(getParkingTicketStatuses(request.body.ticketID, request.session));
};


export default handler;
