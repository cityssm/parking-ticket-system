import type { RequestHandler } from "express";

import * as parkingDB_getLicencePlates from "../../helpers/parkingDB/getLicencePlates";


export const handler: RequestHandler = (req, res) => {

  const queryOptions: parkingDB_getLicencePlates.GetLicencePlatesQueryOptions = {
    limit: req.body.limit,
    offset: req.body.offset,
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
