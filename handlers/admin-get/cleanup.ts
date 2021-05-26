import type { RequestHandler } from "express";

import parkingDB_getDatabaseCleanupCounts from "../../helpers/parkingDB/getDatabaseCleanupCounts.js";


export const handler: RequestHandler = (_req, res) => {

  const counts = parkingDB_getDatabaseCleanupCounts.getDatabaseCleanupCounts();

  return res.render("admin-cleanup", {
    headTitle: "Database Cleanup",
    counts
  });
};


export default handler;
