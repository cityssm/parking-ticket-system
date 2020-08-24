import type { RequestHandler } from "express";

import * as parkingDB_getDatabaseCleanupCounts from "../../helpers/parkingDB/getDatabaseCleanupCounts";

import { userIsAdmin } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userIsAdmin(req)) {
    return res.redirect("/dashboard/?error=accessDenied");
  }

  const counts = parkingDB_getDatabaseCleanupCounts.getDatabaseCleanupCounts();

  return res.render("admin-cleanup", {
    headTitle: "Database Cleanup",
    counts
  });
};
