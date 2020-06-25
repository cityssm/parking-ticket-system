import { Router } from "express";
const router = Router();

import * as vehicleFns from "../helpers/vehicleFns";
import * as parkingDB from "../helpers/parkingDB";
import * as parkingDBLookup from "../helpers/parkingDB-lookup";


router.get("/", (_req, res) => {

  res.render("plate-search", {
    headTitle: "Licence Plates"
  });

});


router.post("/doGetLicencePlates", (req, res) => {

  let queryOptions: parkingDB.GetLicencePlatesQueryOptions = {
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


router.post("/doGetUnreceivedLicencePlateLookupBatches", (req, res) => {

  if (!(req.session.user.userProperties.canUpdate || req.session.user.userProperties.isOperator)) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const batches = parkingDBLookup.getUnreceivedLicencePlateLookupBatches(req.session.user.userProperties.canUpdate);
  res.json(batches);

});

router.post("/doCreateLookupBatch", (req, res) => {

  if (!req.session.user.userProperties.canUpdate) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const createBatchResponse = parkingDBLookup.createLicencePlateLookupBatch(req.session);

  res.json(createBatchResponse);

});

router.post("/doGetLookupBatch", (req, res) => {

  if (!(req.session.user.userProperties.canUpdate || req.session.user.userProperties.isOperator)) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const batch = parkingDBLookup.getLicencePlateLookupBatch(req.body.batchID);
  res.json(batch);
});

router.post("/doAddLicencePlateToLookupBatch", (req, res) => {

  if (!req.session.user.userProperties.canUpdate) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const result = parkingDBLookup.addLicencePlateToLookupBatch(req.body, req.session);

  if (result.success) {
    result.batch = parkingDBLookup.getLicencePlateLookupBatch(req.body.batchID);
  }

  res.json(result);

});

router.post("/doAddAllLicencePlatesToLookupBatch", (req, res) => {

  if (!req.session.user.userProperties.canUpdate) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const result = parkingDBLookup.addAllLicencePlatesToLookupBatch(req.body, req.session);

  res.json(result);

});

router.post("/doRemoveLicencePlateFromLookupBatch", (req, res) => {

  if (!req.session.user.userProperties.canUpdate) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const result = parkingDBLookup.removeLicencePlateFromLookupBatch(req.body, req.session);

  res.json(result);

});

router.post("/doClearLookupBatch", (req, res) => {

  if (!req.session.user.userProperties.canUpdate) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const batchID = parseInt(req.body.batchID, 10);

  const result = parkingDBLookup.clearLookupBatch(batchID, req.session);

  if (result.success) {
    result.batch = parkingDBLookup.getLicencePlateLookupBatch(batchID);
  }

  res.json(result);

});

router.post("/doLockLookupBatch", (req, res) => {

  if (!req.session.user.userProperties.canUpdate) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const batchID = parseInt(req.body.batchID, 10);

  const result = parkingDBLookup.lockLookupBatch(batchID, req.session);

  if (result.success) {

    result.batch = parkingDBLookup.getLicencePlateLookupBatch(batchID);

  }

  res.json(result);

});


router.post("/doGetModelsByMake", (req, res) => {

  const makeModelList = vehicleFns.getModelsByMakeFromCache(req.body.vehicleMake);
  res.json(makeModelList);
});


router.get("/:licencePlateCountry/:licencePlateProvince/:licencePlateNumber", (req, res) => {

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

  const owners = parkingDB.getAllLicencePlateOwners(licencePlateCountry, licencePlateProvince, licencePlateNumber);

  const tickets = parkingDB.getParkingTicketsByLicencePlate(licencePlateCountry, licencePlateProvince, licencePlateNumber, req.session);

  res.render("plate-view", {
    headTitle: "Licence Plate " + licencePlateNumber,

    licencePlateNumber,
    licencePlateProvince,
    licencePlateCountry,

    owners,
    tickets
  });
});

export = router;
