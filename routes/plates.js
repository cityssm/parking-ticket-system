"use strict";
const express = require("express");
const router = express.Router();
const mtoFns = require("../helpers/mtoFns");
const configFns = require("../helpers/configFns");
const vehicleFns = require("../helpers/vehicleFns");
const parkingDB = require("../helpers/parkingDB");
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });
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
if (configFns.getProperty("application.feature_mtoExportImport")) {
    router.get("/mtoExport", function (_req, res) {
        const latestUnlockedBatch = parkingDB.getLicencePlateLookupBatch(-1);
        res.render("mto-plateExport", {
            headTitle: "MTO Licence Plate Export",
            pageContainerIsFullWidth: true,
            batch: latestUnlockedBatch
        });
    });
    router.post("/mto_doGetPlatesAvailableForLookup", function (req, res) {
        const batchID = parseInt(req.body.batchID);
        const issueDaysAgo = parseInt(req.body.issueDaysAgo);
        const availablePlates = parkingDB.mto_getLicencePlatesAvailableForLookupBatch(batchID, issueDaysAgo);
        res.json(availablePlates);
    });
    router.get("/mtoExport/:batchID", function (req, res) {
        const batchID = parseInt(req.params.batchID);
        parkingDB.markLookupBatchAsSent(batchID, req.session);
        const batch = parkingDB.getLicencePlateLookupBatch(batchID);
        const newline = "\n";
        let output = "";
        let recordCount = 0;
        const authorizedUserPadded = (configFns.getProperty("mtoExportImport.authorizedUser") + "    ").substring(0, 4);
        for (let index = 0; index < batch.batchEntries.length; index += 1) {
            const entry = batch.batchEntries[index];
            if (entry.ticketID === null) {
                continue;
            }
            recordCount += 1;
            output += "PKTD" +
                (entry.licencePlateNumber + "          ").substring(0, 10) +
                entry.issueDate.toString().slice(-6) +
                (entry.ticketNumber + "                       ").substring(0, 23) +
                authorizedUserPadded + newline;
        }
        const recordCountPadded = ("000000" + recordCount.toString()).slice(-6);
        output = "PKTA" +
            "    1" +
            batch.sentDate.toString().slice(-6) +
            recordCountPadded +
            "Y" +
            "N" + newline +
            output;
        output += "PKTZ" +
            recordCountPadded + newline;
        res.setHeader("Content-Disposition", "attachment; filename=batch-" + batchID + ".txt");
        res.setHeader("Content-Type", "text/plain");
        res.send(output);
    });
    router.get("/mtoImport", function (_req, res) {
        const unreceivedBatches = parkingDB.getUnreceivedLicencePlateLookupBatches();
        res.render("mto-plateImport", {
            headTitle: "MTO Licence Plate Ownership Import",
            batches: unreceivedBatches
        });
    });
    router.post("/mto_doImportUpload", upload.single("importFile"), function (req, res) {
        const batchID = req.body.batchID;
        const ownershipData = req.file.buffer.toString();
        const results = mtoFns.importLicencePlateOwnership(batchID, ownershipData);
        console.log(results);
        res.json({ success: true });
    });
}
router.post("/doGetUnreceivedLicencePlateLookupBatches", function (_req, res) {
    const batches = parkingDB.getUnreceivedLicencePlateLookupBatches();
    res.json(batches);
});
router.post("/doCreateLookupBatch", function (req, res) {
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
router.post("/doGetLookupBatch", function (req, res) {
    const batch = parkingDB.getLicencePlateLookupBatch(req.body.batchID);
    res.json(batch);
});
router.post("/doAddLicencePlateToLookupBatch", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
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
    if (!req.session.user.userProperties.canCreate) {
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
    if (!req.session.user.userProperties.canCreate) {
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
    if (!req.session.user.userProperties.canCreate) {
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
    if (!req.session.user.userProperties.canCreate) {
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
module.exports = router;
