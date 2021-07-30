import type { RequestHandler } from "express";

import { updateParkingTicketStatus } from "../../helpers/parkingDB/updateParkingTicketStatus.js";


export const handler: RequestHandler = (request, response) => {

  const result = updateParkingTicketStatus(request.body, request.session);

  return response.json(result);
};


export default handler;
