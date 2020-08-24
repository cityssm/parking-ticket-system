import type { RequestHandler } from "express";

import * as parkingDB_getParkingLocations from "../../helpers/parkingDB/getParkingLocations";

import { userIsAdmin } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userIsAdmin(req)) {
    return res.redirect("/dashboard/?error=accessDenied");
  }

  const locations = parkingDB_getParkingLocations.getParkingLocations();

  return res.render("location-maint", {
    headTitle: "Parking Location Maintenance",
    locations
  });
};
