"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const stringFns_1 = require("@cityssm/expressjs-server-js/stringFns");
const parkingDB_reporting = require("../../helpers/parkingDB-reporting");
exports.handler = (req, res) => {
    const reportName = req.params.reportName;
    const rowsColumnsObj = parkingDB_reporting.getReportRowsColumns(reportName, req.query);
    if (!rowsColumnsObj) {
        res.redirect("/reports/?error=reportNotAvailable");
        return;
    }
    const csv = stringFns_1.rawToCSV(rowsColumnsObj);
    res.setHeader("Content-Disposition", "attachment; filename=" + reportName + "-" + Date.now().toString() + ".csv");
    res.setHeader("Content-Type", "text/csv");
    res.send(csv);
};
