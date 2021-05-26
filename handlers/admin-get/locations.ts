import type { RequestHandler } from "express";

import getParkingLocations from "../../helpers/parkingDB/getParkingLocations.js";


export const handler: RequestHandler = (_req, res) => {

  const locations = getParkingLocations();

  return res.render("location-maint", {
    headTitle: "Parking Location Maintenance",
    locations
  });
};


export default handler;
