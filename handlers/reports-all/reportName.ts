import type { RequestHandler } from "express";

import { rawToCSV } from "@cityssm/expressjs-server-js/stringFns.js";

import * as parkingDB_reporting from "../../helpers/parkingDB-reporting.js";


export const handler: RequestHandler = (req, res) => {

  const reportName = req.params.reportName;

  const rowsColumnsObj = parkingDB_reporting.getReportRowsColumns(reportName, req.query);

  if (!rowsColumnsObj) {
    res.redirect("/reports/?error=reportNotAvailable");
    return;
  }

  const csv = rawToCSV(rowsColumnsObj);

  res.setHeader("Content-Disposition", "attachment; filename=" + reportName + "-" + Date.now().toString() + ".csv");
  res.setHeader("Content-Type", "text/csv");
  res.send(csv);
};


export default handler;
