import type { RequestHandler } from "express";

import * as parkingDB_getParkingBylaws from "../../helpers/parkingDB/getParkingBylaws";


export const handler: RequestHandler = (_req, res) => {

  const bylaws = parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats();

  return res.render("bylaw-maint", {
    headTitle: "By-Law Maintenance",
    bylaws
  });
};
