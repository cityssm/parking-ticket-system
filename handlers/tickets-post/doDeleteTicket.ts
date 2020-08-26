import type { RequestHandler } from "express";

import * as parkingDB_deleteParkingTicket from "../../helpers/parkingDB/deleteParkingTicket";


export const handler: RequestHandler = (req, res) => {

 const result = parkingDB_deleteParkingTicket.deleteParkingTicket(req.body.ticketID, req.session);

 return res.json(result);
};
