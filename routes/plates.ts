import { Router } from "express";

import * as vehicleFns from "../helpers/vehicleFns";

import * as parkingDB_getParkingTicketsByLicencePlate from "../helpers/parkingDB/getParkingTicketsByLicencePlate";
import * as parkingDB_getLicencePlates from "../helpers/parkingDB/getLicencePlates";
import * as parkingDB_getAllLicencePlateOwners from "../helpers/parkingDB/getAllLicencePlateOwners";

import * as parkingDB_getUnreceivedLookupBatches from "../helpers/parkingDB/getUnreceivedLookupBatches";
import * as parkingDB_getLookupBatch from "../helpers/parkingDB/getLookupBatch";
import * as parkingDB_createLookupBatch from "../helpers/parkingDB/createLookupBatch";
import * as parkingDB_addLicencePlateToLookupBatch from "../helpers/parkingDB/addLicencePlateToLookupBatch";
import * as parkingDB_clearLookupBatch from "../helpers/parkingDB/clearLookupBatch";
import * as parkingDB_removeLicencePlateFromLookupBatch from "../helpers/parkingDB/removeLicencePlateFromLookupBatch";
import * as parkingDB_lockLookupBatch from "../helpers/parkingDB/lockLookupBatch";

import { userCanUpdate, userIsOperator } from "../helpers/userFns";

const router = Router();


router.get("/", (_req, res) => {

  res.render("plate-search", {
    headTitle: "Licence Plates"
  });

});


router.post("/doGetLicencePlates", (req, res) => {

  const queryOptions: parkingDB_getLicencePlates.GetLicencePlatesQueryOptions = {
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

  res.json(parkingDB_getLicencePlates.getLicencePlates(queryOptions));

});


router.post("/doGetUnreceivedLicencePlateLookupBatches", (req, res) => {

  if (!(userCanUpdate(req) || userIsOperator(req))) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const batches = parkingDB_getUnreceivedLookupBatches.getUnreceivedLookupBatches(req.session.user.userProperties.canUpdate);
  res.json(batches);

});

router.post("/doCreateLookupBatch", (req, res) => {

  if (!userCanUpdate(req)) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const createBatchResponse = parkingDB_createLookupBatch.createLookupBatch(req.session);

  res.json(createBatchResponse);

});

router.post("/doGetLookupBatch", (req, res) => {

  if (!(userCanUpdate(req) || userIsOperator(req))) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const batch = parkingDB_getLookupBatch.getLookupBatch(req.body.batchID);
  res.json(batch);
});

router.post("/doAddLicencePlateToLookupBatch", (req, res) => {

  if (!userCanUpdate(req)) {

    return res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });
  }

  const result = parkingDB_addLicencePlateToLookupBatch.addLicencePlateToLookupBatch(req.body, req.session);

  if (result.success) {
    result.batch = parkingDB_getLookupBatch.getLookupBatch(req.body.batchID);
  }

  res.json(result);

});

router.post("/doAddAllLicencePlatesToLookupBatch", (req, res) => {

  if (!userCanUpdate(req)) {

    return res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

  }

  const result = parkingDB_addLicencePlateToLookupBatch.addAllLicencePlatesToLookupBatch(req.body, req.session);

  return res.json(result);

});

router.post("/doRemoveLicencePlateFromLookupBatch", (req, res) => {

  if (!userCanUpdate(req)) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const result = parkingDB_removeLicencePlateFromLookupBatch.removeLicencePlateFromLookupBatch(req.body, req.session);

  res.json(result);

});

router.post("/doClearLookupBatch", (req, res) => {

  if (!userCanUpdate(req)) {

    return res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

  }

  const batchID = parseInt(req.body.batchID, 10);

  const result = parkingDB_clearLookupBatch.clearLookupBatch(batchID, req.session);

  if (result.success) {
    result.batch = parkingDB_getLookupBatch.getLookupBatch(batchID);
  }

  res.json(result);

});

router.post("/doLockLookupBatch", (req, res) => {

  if (!userCanUpdate(req)) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const batchID = parseInt(req.body.batchID, 10);

  const result = parkingDB_lockLookupBatch.lockLookupBatch(batchID, req.session);

  if (result.success) {

    result.batch = parkingDB_getLookupBatch.getLookupBatch(batchID);

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

  const owners = parkingDB_getAllLicencePlateOwners.getAllLicencePlateOwners(licencePlateCountry, licencePlateProvince, licencePlateNumber);

  const tickets =
    parkingDB_getParkingTicketsByLicencePlate.getParkingTicketsByLicencePlate(licencePlateCountry, licencePlateProvince, licencePlateNumber,
      req.session);

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
