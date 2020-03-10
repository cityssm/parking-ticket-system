"use strict";

import express = require("express");
const router = express.Router();

import * as vehicleFns from "../helpers/vehicleFns";
import * as parkingDB from "../helpers/parkingDB";


router.get("/", function(_req, res) {

  res.render("plate-search", {
    headTitle: "Licence Plates"
  });

});


router.post("/doGetLicencePlates", function(req, res) {

  let queryOptions: parkingDB.getLicencePlates_queryOptions = {
    limit: req.body.limit,
    offset: req.body.offset,
    licencePlateNumber: req.body.licencePlateNumber
  };

  if (req.body.hasOwnerRecord !== "") {
    queryOptions.hasOwnerRecord = (req.body.hasOwnerRecord === "1");
  }

  if (req.body.hasUnresolvedTickets !== "") {
    queryOptions.hasUnresolvedTickets = (req.body.hasUnresolvedTickets === "1");
  }

  res.json(parkingDB.getLicencePlates(queryOptions));

});


router.post("/doGetModelsByMake", function(req, res) {

  vehicleFns.getModelsByMake(req.body.vehicleMake, function(makeModelList) {

    res.json(makeModelList);
    return;

  });
});


router.get("/:licencePlateCountry/:licencePlateProvince/:licencePlateNumber", function(req, res) {

  let licencePlateCountry = req.params.licencePlateCountry;

  if (licencePlateCountry === "_") {
    licencePlateCountry = "";
  }

  let licencePlateProvince = req.params.licencePlateProvince;

  if (licencePlateProvince === "_") {
    licencePlateProvince = "";
  }

  let licencePlateNumber = req.params.licencePlateNumber;

  if (licencePlateNumber === "_") {
    licencePlateNumber = "";
  }

  const owner = parkingDB.getLicencePlateOwner(licencePlateCountry, licencePlateProvince, licencePlateNumber);

  res.render("plate-view", {
    headTitle: "Licence Plate " + licencePlateNumber,

    licencePlateNumber: licencePlateNumber,
    licencePlateProvince: licencePlateProvince,
    licencePlateCountry: licencePlateCountry,

    owner: owner
  });
});

export = router;
