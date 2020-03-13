"use strict";
const express = require("express");
const router = express.Router();
const parkingDB = require("../helpers/parkingDB");
const stringFns_1 = require("../helpers/stringFns");
const dateTimeFns = require("../helpers/dateTimeFns");
router.get("/", function (_req, res) {
    const rightNow = new Date();
    res.render("report-search", {
        headTitle: "Reports",
        todayDateString: dateTimeFns.dateToString(rightNow)
    });
});
router.all("/:reportName", function (req, res) {
    const reportName = req.params.reportName;
    let sql = "";
    let params = [];
    switch (reportName) {
        case "locations-all":
            sql = "select * from Locations";
            break;
        case "representatives-byOrganization":
            sql = "select organizationID, representativeIndex," +
                " representativeName, representativeTitle," +
                " representativeAddress1, representativeAddress2, representativeCity, representativeProvince," +
                " representativePostalCode, representativePhoneNumber, representativeEmailAddress," +
                " isDefault" +
                " from OrganizationRepresentatives" +
                " where organizationID = ?";
            params = [req.query.organizationID];
            break;
    }
    if (sql === "") {
        res.redirect("/reports/?error=reportNotFound");
        return;
    }
    const rowsColumnsObj = parkingDB.getRawRowsColumns(sql, params);
    const csv = stringFns_1.rawToCSV(rowsColumnsObj);
    res.setHeader("Content-Disposition", "attachment; filename=" + reportName + "-" + Date.now() + ".csv");
    res.setHeader("Content-Type", "text/csv");
    res.send(csv);
});
module.exports = router;
