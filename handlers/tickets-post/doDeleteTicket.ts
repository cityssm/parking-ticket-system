import type { RequestHandler } from "express";

import * as parkingDB_deleteParkingTicket from "../../helpers/parkingDB/deleteParkingTicket";

import { userCanCreate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

 if (!userCanCreate(req)) {
   return forbiddenJSON(res);
 }

 const result = parkingDB_deleteParkingTicket.deleteParkingTicket(req.body.ticketID, req.session);

 return res.json(result);
};
