import { Router } from "express";

import * as parkingDBReporting from "../helpers/parkingDB-reporting";
import { rawToCSV } from "@cityssm/expressjs-server-js/stringFns";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

const router = Router();


router.get("/", (_req, res) => {

  const rightNow = new Date();

  res.render("report-search", {
    headTitle: "Reports",
    todayDateString: dateTimeFns.dateToString(rightNow)
  });

});


router.all("/:reportName", (req, res) => {

  const reportName = req.params.reportName;

  const rowsColumnsObj = parkingDBReporting.getReportRowsColumns(reportName, req.query);

  if (!rowsColumnsObj) {
    res.redirect("/reports/?error=reportNotAvailable");
    return;
  }

  const csv = rawToCSV(rowsColumnsObj);

  res.setHeader("Content-Disposition", "attachment; filename=" + reportName + "-" + Date.now().toString() + ".csv");
  res.setHeader("Content-Type", "text/csv");
  res.send(csv);

});


export = router;
