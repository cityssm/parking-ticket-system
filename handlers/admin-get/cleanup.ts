import type { RequestHandler } from "express";

import * as parkingDB_getDatabaseCleanupCounts from "../../helpers/parkingDB/getDatabaseCleanupCounts";


export const handler: RequestHandler = (_req, res) => {

  const counts = parkingDB_getDatabaseCleanupCounts.getDatabaseCleanupCounts();

  return res.render("admin-cleanup", {
    headTitle: "Database Cleanup",
    counts
  });
};
