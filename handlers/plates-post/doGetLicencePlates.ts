import type { RequestHandler } from "express";

import * as parkingDB_getLicencePlates from "../../helpers/parkingDB/getLicencePlates.js";


export const handler: RequestHandler = (req, res) => {

  const queryOptions: parkingDB_getLicencePlates.GetLicencePlatesQueryOptions = {
    limit: parseInt(req.body.limit, 10),
    offset: parseInt(req.body.offset, 10),
    licencePlateNumber: req.body.licencePlateNumber
  };

  if (req.body.hasOwnerRecord !== "") {
    queryOptions.hasOwnerRecord = (req.body.hasOwnerRecord === "1");
  }

  if (req.body.hasUnresolvedTickets !== "") {
    queryOptions.hasUnresolvedTickets = (req.body.hasUnresolvedTickets === "1");
  }

  res.json(parkingDB_getLicencePlates.getLicencePlates(queryOptions));
};


export default handler;
