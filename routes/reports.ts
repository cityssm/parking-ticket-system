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
     * Locations
     */

    case "locations-all":

      sql = "select * from Locations";
      break;


    /*
     * Organization Representatives
     */

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

  const csv = rawToCSV(rowsColumnsObj);

  res.setHeader("Content-Disposition", "attachment; filename=" + reportName + "-" + Date.now() + ".csv");
  res.setHeader("Content-Type", "text/csv");
  res.send(csv);

});


export = router;
