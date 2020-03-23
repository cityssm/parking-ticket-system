"use strict";

import express = require("express");
const router = express.Router();

import * as configFns from "../helpers/configFns";

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


/*
 * MTO Export / Import
 */


if (configFns.getProperty("application.feature_mtoExportImport")) {

  router.get("/mtoExport", function(_req, res) {

    const latestUnlockedBatch = parkingDB.getLicencePlateLookupBatch(-1);

    res.render("mto-plateExport", {
      headTitle: "MTO Licence Plate Export",
      pageContainerIsFullWidth: true,
      batch: latestUnlockedBatch
    });

  });

  router.get("/mtoImport", function(_req, res) {

    res.render("mto-plateImport", {
      headTitle: "MTO Licence Plate Ownership Import"
    });

  });

  router.post("/mto_doGetPlatesAvailableForLookup", function(req, res) {

    const issueDaysAgo = parseInt(req.body.issueDaysAgo);
    const availablePlates = parkingDB.mto_getLicencePlatesAvailableForLookupBatch(issueDaysAgo);
    res.json(availablePlates);

  });
}


router.post("/doGetUnsentLicencePlateLookupBatches", function(_req, res) {

  const batches = parkingDB.getUnsentLicencePlateLookupBatches();
  res.json(batches);
});

router.post("/doCreateLookupBatch", function(req, res) {

  if (!req.session.user.userProperties.canCreate) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const createBatchResponse = parkingDB.createLicencePlateLookupBatch(req.session);

  res.json(createBatchResponse);

});

router.post("/doGetLookupBatch", function(req, res) {

  const batch = parkingDB.getLicencePlateLookupBatch(req.body.batchID);
  res.json(batch);
});


router.post("/doGetModelsByMake", function(req, res) {

  const makeModelList = vehicleFns.getModelsByMakeFromCache(req.body.vehicleMake);
  res.json(makeModelList);
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

  const tickets = parkingDB.getParkingTicketsByLicencePlate(licencePlateCountry, licencePlateProvince, licencePlateNumber, req.session);

  res.render("plate-view", {
    headTitle: "Licence Plate " + licencePlateNumber,

    licencePlateNumber: licencePlateNumber,
    licencePlateProvince: licencePlateProvince,
    licencePlateCountry: licencePlateCountry,

    owner: owner,
    tickets: tickets
  });
});

export = router;
