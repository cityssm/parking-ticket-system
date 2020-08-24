import type { RequestHandler } from "express";

import * as parkingDB_deleteParkingTicketRemark from "../../helpers/parkingDB/deleteParkingTicketRemark";

import { userCanCreate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_deleteParkingTicketRemark.deleteParkingTicketRemark(
    req.body.ticketID,
    req.body.remarkIndex,
    req.session
  );

  return res.json(result);
};
