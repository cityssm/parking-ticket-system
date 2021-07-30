import type { RequestHandler } from "express";

import { deleteParkingTicketRemark } from "../../helpers/parkingDB/deleteParkingTicketRemark.js";


export const handler: RequestHandler = (request, response) => {

  const result = deleteParkingTicketRemark(
    request.body.ticketID,
    request.body.remarkIndex,
    request.session
  );

  return response.json(result);
};


export default handler;
