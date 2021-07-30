import type { RequestHandler } from "express";

import { deleteParkingTicketStatus } from "../../helpers/parkingDB/deleteParkingTicketStatus.js";


export const handler: RequestHandler = (request, response) => {

  const result = deleteParkingTicketStatus(
    request.body.ticketID,
    request.body.statusIndex,
    request.session
  );

  return response.json(result);
};


export default handler;
