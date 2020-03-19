"use strict";

import express = require("express");
const router = express.Router();

import * as parkingDB from "../helpers/parkingDB";
import { rawToCSV } from "../helpers/stringFns";
import * as dateTimeFns from "../helpers/dateTimeFns";

router.get("/", function(_req, res) {

  const rightNow = new Date();

  res.render("report-search", {
    headTitle: "Reports",
    todayDateString: dateTimeFns.dateToString(rightNow)
  });

});


router.all("/:reportName", function(req, res) {

  const reportName = req.params.reportName;

  let sql = "";
  let params = [];

  switch (reportName) {

    /*
     * Parking Tickets
     */

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


    /*
     * Licence Plates
     */

    case "owners-all":

      sql = "select * from LicencePlateOwners";
      break;

    /*
    Sample for lottery-licence-manager that uses parameters

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
    */

  }

  if (sql === "") {

    res.redirect("/reports/?error=reportNotFound");
    return;

  }

  const rowsColumnsObj = parkingDB.getRawRowsColumns(sql, params);

  const csv = rawToCSV(rowsColumnsObj);

  res.setHeader("Content-Disposition", "attachment; filename=" + reportName + "-" + Date.now() + ".csv");
  res.setHeader("Content-Type", "text/csv");
  res.send(csv);

});


export = router;