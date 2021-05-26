import type { RequestHandler } from "express";

import getDatabaseCleanupCounts from "../../helpers/parkingDB/getDatabaseCleanupCounts.js";


export const handler: RequestHandler = (_req, res) => {

  const counts = getDatabaseCleanupCounts();

  return res.render("admin-cleanup", {
    headTitle: "Database Cleanup",
    counts
  });
};


export default handler;
