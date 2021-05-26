import type { RequestHandler } from "express";

import getParkingLocations from "../../helpers/parkingDB/getParkingLocations.js";
import getParkingBylaws from "../../helpers/parkingDB/getParkingBylaws.js";
import getParkingOffences from "../../helpers/parkingDB/getParkingOffences.js";


export const handler: RequestHandler = (_req, res) => {

  const locations = getParkingLocations();
  const bylaws = getParkingBylaws();
  const offences = getParkingOffences();

  return res.render("offence-maint", {
    headTitle: "Parking Offences",
    locations,
    bylaws,
    offences
  });
};


export default handler;
