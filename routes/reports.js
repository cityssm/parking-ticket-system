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
        case "tickets-all":
            sql = "select * from ParkingTickets";
            break;
        case "tickets-unresolved":
            sql = "select t.ticketID, t.ticketNumber, t.issueDate," +
                " t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber," +
                " t.locationKey, l.locationName, l.locationClassKey, t.locationDescription," +
                " t.parkingOffence, t.offenceAmount," +
                " s.statusDate as latestStatus_statusDate," +
                " s.statusKey as latestStatus_statusKey," +
                " t.recordCreate_userName, t.recordCreate_timeMillis, t.recordUpdate_userName, t.recordUpdate_timeMillis" +
                " from ParkingTickets t" +
                " left join ParkingLocations l on t.locationKey = l.locationKey" +
                (" left join ParkingTicketStatusLog s on t.ticketID = s.ticketID" +
                    " and s.statusIndex = (select statusIndex from ParkingTicketStatusLog s where t.ticketID = s.ticketID order by s.statusDate desc, s.statusTime desc, s.statusIndex desc limit 1)") +
                " where t.recordDelete_timeMillis is null" +
                " and t.resolvedDate is null";
            break;
        case "statuses-all":
            sql = "select * from ParkingTicketStatusLog";
            break;
        case "statuses-byTicketID":
            sql = "select * from ParkingTicketStatusLog" +
                " where recordDelete_timeMillis is null" +
                " and ticketID = ?";
            params = [req.query.ticketID];
            break;
        case "remarks-all":
            sql = "select * from ParkingTicketRemarks";
            break;
        case "remarks-byTicketID":
            sql = "select * from ParkingTicketRemarks" +
                " where recordDelete_timeMillis is null" +
                " and ticketID = ?";
            params = [req.query.ticketID];
            break;
        case "owners-all":
            sql = "select * from LicencePlateOwners";
            break;
        case "lookupErrorLog-all":
            sql = "select * from LicencePlateLookupErrorLog";
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
