"use strict";
const express_1 = require("express");
const router = express_1.Router();
const parkingDBReporting = require("../helpers/parkingDB-reporting");
const stringFns_1 = require("@cityssm/expressjs-server-js/stringFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
router.get("/", function (_req, res) {
    const rightNow = new Date();
    res.render("report-search", {
        headTitle: "Reports",
        todayDateString: dateTimeFns.dateToString(rightNow)
    });
});
router.all("/:reportName", function (req, res) {
    const reportName = req.params.reportName;
    const rowsColumnsObj = parkingDBReporting.getReportRowsColumns(reportName, req.query);
    if (!rowsColumnsObj) {
        res.redirect("/reports/?error=reportNotAvailable");
        return;
    }
    const csv = stringFns_1.rawToCSV(rowsColumnsObj);
    res.setHeader("Content-Disposition", "attachment; filename=" + reportName + "-" + Date.now() + ".csv");
    res.setHeader("Content-Type", "text/csv");
    res.send(csv);
});
module.exports = router;
