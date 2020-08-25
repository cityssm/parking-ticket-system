"use strict";
const express_1 = require("express");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const handler_reportName = require("../handlers/reports-all/reportName");
const router = express_1.Router();
router.get("/", (_req, res) => {
    const rightNow = new Date();
    res.render("report-search", {
        headTitle: "Reports",
        todayDateString: dateTimeFns.dateToString(rightNow)
    });
});
router.all("/:reportName", handler_reportName.handler);
module.exports = router;
