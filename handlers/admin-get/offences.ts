import type { RequestHandler } from "express";

import * as parkingDB_getParkingLocations from "../../helpers/parkingDB/getParkingLocations";
import * as parkingDB_getParkingBylaws from "../../helpers/parkingDB/getParkingBylaws";
import * as parkingDB_getParkingOffences from "../../helpers/parkingDB/getParkingOffences";

import { userIsAdmin } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userIsAdmin(req)) {
    return res.redirect("/dashboard/?error=accessDenied");
  }

  const locations = parkingDB_getParkingLocations.getParkingLocations();
  const bylaws = parkingDB_getParkingBylaws.getParkingBylaws();
  const offences = parkingDB_getParkingOffences.getParkingOffences();

  return res.render("offence-maint", {
    headTitle: "Parking Offences",
    locations,
    bylaws,
    offences
  });
};
