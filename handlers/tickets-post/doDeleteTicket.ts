import type { RequestHandler } from "express";

import { deleteParkingTicket } from "../../helpers/parkingDB/deleteParkingTicket.js";


export const handler: RequestHandler = (request, response) => {

 const result = deleteParkingTicket(request.body.ticketID, request.session);

 return response.json(result);
};


export default handler;
