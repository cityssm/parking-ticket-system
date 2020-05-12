"use strict";
const express_1 = require("express");
const router = express_1.Router();
const vehicleFns = require("../helpers/vehicleFns");
const parkingDB = require("../helpers/parkingDB");
router.get("/", function (_req, res) {
    res.render("plate-search", {
        headTitle: "Licence Plates"
    });
});
router.post("/doGetLicencePlates", function (req, res) {
    let queryOptions = {
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
router.post("/doGetUnreceivedLicencePlateLookupBatches", function (req, res) {
    if (!(req.session.user.userProperties.canUpdate || req.session.user.userProperties.isOperator)) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const batches = parkingDB.getUnreceivedLicencePlateLookupBatches(req.session.user.userProperties.canUpdate);
    res.json(batches);
});
router.post("/doCreateLookupBatch", function (req, res) {
    if (!req.session.user.userProperties.canUpdate) {
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
router.post("/doGetLookupBatch", function (req, res) {
    if (!(req.session.user.userProperties.canUpdate || req.session.user.userProperties.isOperator)) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const batch = parkingDB.getLicencePlateLookupBatch(req.body.batchID);
    res.json(batch);
});
router.post("/doAddLicencePlateToLookupBatch", function (req, res) {
    if (!req.session.user.userProperties.canUpdate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const result = parkingDB.addLicencePlateToLookupBatch(req.body, req.session);
    if (result.success) {
        result.batch = parkingDB.getLicencePlateLookupBatch(req.body.batchID);
    }
    res.json(result);
});
router.post("/doAddAllLicencePlatesToLookupBatch", function (req, res) {
    if (!req.session.user.userProperties.canUpdate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    console.log(req.body.licencePlateNumbers.length);
    const result = parkingDB.addAllLicencePlatesToLookupBatch(req.body, req.session);
    res.json(result);
});
router.post("/doRemoveLicencePlateFromLookupBatch", function (req, res) {
    if (!req.session.user.userProperties.canUpdate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const result = parkingDB.removeLicencePlateFromLookupBatch(req.body, req.session);
    res.json(result);
});
router.post("/doClearLookupBatch", function (req, res) {
    if (!req.session.user.userProperties.canUpdate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const batchID = parseInt(req.body.batchID);
    const result = parkingDB.clearLookupBatch(batchID, req.session);
    if (result.success) {
        result.batch = parkingDB.getLicencePlateLookupBatch(batchID);
    }
    res.json(result);
});
router.post("/doLockLookupBatch", function (req, res) {
    if (!req.session.user.userProperties.canUpdate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const batchID = parseInt(req.body.batchID);
    const result = parkingDB.lockLookupBatch(batchID, req.session);
    if (result.success) {
        result.batch = parkingDB.getLicencePlateLookupBatch(batchID);
    }
    res.json(result);
});
router.post("/doGetModelsByMake", function (req, res) {
    const makeModelList = vehicleFns.getModelsByMakeFromCache(req.body.vehicleMake);
    res.json(makeModelList);
});
router.get("/:licencePlateCountry/:licencePlateProvince/:licencePlateNumber", function (req, res) {
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
        licencePlateNumber: licencePlateNumber,
        licencePlateProvince: licencePlateProvince,
        licencePlateCountry: licencePlateCountry,
        owners: owners,
        tickets: tickets
    });
});
module.exports = router;
