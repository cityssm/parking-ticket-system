import type { RequestHandler } from "express";

import { getParkingBylawsWithOffenceStats } from "../../helpers/parkingDB/getParkingBylaws.js";


export const handler: RequestHandler = (_req, res) => {

  const bylaws = getParkingBylawsWithOffenceStats();

  return res.render("bylaw-maint", {
    headTitle: "By-Law Maintenance",
    bylaws
  });
};


export default handler;
