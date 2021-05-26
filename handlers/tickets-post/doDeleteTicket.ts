import type { RequestHandler } from "express";

import deleteParkingTicket from "../../helpers/parkingDB/deleteParkingTicket.js";


export const handler: RequestHandler = (req, res) => {

 const result = deleteParkingTicket(req.body.ticketID, req.session);

 return res.json(result);
};


export default handler;
