"use strict";
const express_1 = require("express");
const router = express_1.Router();
const mtoFns = require("../helpers/mtoFns");
const parkingDB = require("../helpers/parkingDB");
const parkingDB_ontario = require("../helpers/parkingDB-ontario");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.get("/mtoExport", function (req, res) {
    if (!(req.session.user.userProperties.canUpdate || req.session.user.userProperties.isOperator)) {
        res.redirect("/plates/?error=accessDenied");
        return;
    }
    const latestUnlockedBatch = parkingDB.getLicencePlateLookupBatch(-1);
    res.render("mto-plateExport", {
        headTitle: "MTO Licence Plate Export",
        batch: latestUnlockedBatch
    });
});
router.post("/doGetPlatesAvailableForMTOLookup", function (req, res) {
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
    const issueDaysAgo = parseInt(req.body.issueDaysAgo, 10);
    const availablePlates = parkingDB_ontario.getLicencePlatesAvailableForMTOLookupBatch(batchID, issueDaysAgo);
    res.json(availablePlates);
});
router.get("/mtoExport/:batchID", function (req, res) {
    if (!(req.session.user.userProperties.canUpdate || req.session.user.userProperties.isOperator)) {
        res.redirect("/plates/?error=accessDenied");
        return;
    }
    const batchID = parseInt(req.params.batchID, 10);
    const output = mtoFns.exportLicencePlateBatch(batchID, req.session);
    res.setHeader("Content-Disposition", "attachment; filename=lookupBatch-" + batchID + ".txt");
    res.setHeader("Content-Type", "text/plain");
    res.send(output);
});
router.get("/mtoImport", function (req, res) {
    if (!(req.session.user.userProperties.canUpdate || req.session.user.userProperties.isOperator)) {
        res.redirect("/plates/?error=accessDenied");
        return;
    }
    const unreceivedBatches = parkingDB.getUnreceivedLicencePlateLookupBatches(false);
    res.render("mto-plateImport", {
        headTitle: "MTO Licence Plate Ownership Import",
        batches: unreceivedBatches
    });
});
router.post("/doMTOImportUpload", upload.single("importFile"), function (req, res) {
    if (!(req.session.user.userProperties.canUpdate || req.session.user.userProperties.isOperator)) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const batchID = req.body.batchID;
    const ownershipData = req.file.buffer.toString();
    const results = mtoFns.importLicencePlateOwnership(batchID, ownershipData, req.session);
    res.json(results);
});
module.exports = router;
