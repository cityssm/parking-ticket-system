import type { RequestHandler } from "express";

import * as parkingDB_getParkingLocations from "../../helpers/parkingDB/getParkingLocations";


export const handler: RequestHandler = (_req, res) => {

  const locations = parkingDB_getParkingLocations.getParkingLocations();

  return res.render("location-maint", {
    headTitle: "Parking Location Maintenance",
    locations
  });
};
