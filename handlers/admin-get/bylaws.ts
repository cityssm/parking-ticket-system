import type { RequestHandler } from "express";

import * as parkingDB_getParkingBylaws from "../../helpers/parkingDB/getParkingBylaws";

import { userIsAdmin } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userIsAdmin(req)) {
    return res.redirect("/dashboard/?error=accessDenied");
  }

  const bylaws = parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats();

  return res.render("bylaw-maint", {
    headTitle: "By-Law Maintenance",
    bylaws
  });
};
