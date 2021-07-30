import type { RequestHandler } from "express";

import { rawToCSV } from "@cityssm/expressjs-server-js/stringFns.js";

import * as parkingDB_reporting from "../../helpers/parkingDB-reporting.js";


export const handler: RequestHandler = (request, response) => {

  const reportName = request.params.reportName;

  const rowsColumnsObject = parkingDB_reporting.getReportRowsColumns(reportName, request.query);

  if (!rowsColumnsObject) {
    response.redirect("/reports/?error=reportNotAvailable");
    return;
  }

  const csv = rawToCSV(rowsColumnsObject);

  response.setHeader("Content-Disposition", "attachment; filename=" + reportName + "-" + Date.now().toString() + ".csv");
  response.setHeader("Content-Type", "text/csv");
  response.send(csv);
};


export default handler;
