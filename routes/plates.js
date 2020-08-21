"use strict";
const express_1 = require("express");
const vehicleFns = require("../helpers/vehicleFns");
const parkingDB_getParkingTicketsByLicencePlate = require("../helpers/parkingDB/getParkingTicketsByLicencePlate");
const parkingDB_getLicencePlates = require("../helpers/parkingDB/getLicencePlates");
const parkingDB_getAllLicencePlateOwners = require("../helpers/parkingDB/getAllLicencePlateOwners");
const parkingDB_getUnreceivedLookupBatches = require("../helpers/parkingDB/getUnreceivedLookupBatches");
const parkingDB_getLookupBatch = require("../helpers/parkingDB/getLookupBatch");
const parkingDB_createLookupBatch = require("../helpers/parkingDB/createLookupBatch");
const parkingDB_addLicencePlateToLookupBatch = require("../helpers/parkingDB/addLicencePlateToLookupBatch");
const parkingDB_clearLookupBatch = require("../helpers/parkingDB/clearLookupBatch");
const parkingDB_removeLicencePlateFromLookupBatch = require("../helpers/parkingDB/removeLicencePlateFromLookupBatch");
const parkingDB_lockLookupBatch = require("../helpers/parkingDB/lockLookupBatch");
const userFns_1 = require("../helpers/userFns");
const router = express_1.Router();
router.get("/", (_req, res) => {
    res.render("plate-search", {
        headTitle: "Licence Plates"
    });
});
router.post("/doGetLicencePlates", (req, res) => {
    const queryOptions = {
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
    if (!(userFns_1.userCanUpdate(req) || userFns_1.userIsOperator(req))) {
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
    if (!userFns_1.userCanUpdate(req)) {
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
    if (!(userFns_1.userCanUpdate(req) || userFns_1.userIsOperator(req))) {
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
    if (!userFns_1.userCanUpdate(req)) {
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
    if (!userFns_1.userCanUpdate(req)) {
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
    if (!userFns_1.userCanUpdate(req)) {
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
    if (!userFns_1.userCanUpdate(req)) {
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
    if (!userFns_1.userCanUpdate(req)) {
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
    const tickets = parkingDB_getParkingTicketsByLicencePlate.getParkingTicketsByLicencePlate(licencePlateCountry, licencePlateProvince, licencePlateNumber, req.session);
    res.render("plate-view", {
        headTitle: "Licence Plate " + licencePlateNumber,
        licencePlateNumber,
        licencePlateProvince,
        licencePlateCountry,
        owners,
        tickets
    });
});
module.exports = router;
