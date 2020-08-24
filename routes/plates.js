"use strict";
const express_1 = require("express");
const handler_doGetLicencePlates = require("../handlers/plates-post/doGetLicencePlates");
const handler_doGetUnreceivedLicencePlateLookupBatches = require("../handlers/plates-post/doGetUnreceivedLicencePlateLookupBatches");
const handler_doGetLookupBatch = require("../handlers/plates-post/doGetLookupBatch");
const handler_doCreateLookupBatch = require("../handlers/plates-post/doCreateLookupBatch");
const handler_doAddLicencePlateToLookupBatch = require("../handlers/plates-post/doAddLicencePlateToLookupBatch");
const handler_doAddAllLicencePlatesToLookupBatch = require("../handlers/plates-post/doAddAllLicencePlatesToLookupBatch");
const handler_doRemoveLicencePlateFromLookupBatch = require("../handlers/plates-post/doRemoveLicencePlateFromLookupBatch");
const handler_doClearLookupBatch = require("../handlers/plates-post/doClearLookupBatch");
const handler_doLockLookupBatch = require("../handlers/plates-post/doLockLookupBatch");
const handler_doGetModelsByMake = require("../handlers/plates-post/doGetModelsByMake");
const handler_view = require("../handlers/plates-get/view");
const router = express_1.Router();
router.get("/", (_req, res) => {
    res.render("plate-search", {
        headTitle: "Licence Plates"
    });
});
router.post("/doGetLicencePlates", handler_doGetLicencePlates.handler);
router.post("/doGetUnreceivedLicencePlateLookupBatches", handler_doGetUnreceivedLicencePlateLookupBatches.handler);
router.post("/doCreateLookupBatch", handler_doCreateLookupBatch.handler);
router.post("/doGetLookupBatch", handler_doGetLookupBatch.handler);
router.post("/doAddLicencePlateToLookupBatch", handler_doAddLicencePlateToLookupBatch.handler);
router.post("/doAddAllLicencePlatesToLookupBatch", handler_doAddAllLicencePlatesToLookupBatch.handler);
router.post("/doRemoveLicencePlateFromLookupBatch", handler_doRemoveLicencePlateFromLookupBatch.handler);
router.post("/doClearLookupBatch", handler_doClearLookupBatch.handler);
router.post("/doLockLookupBatch", handler_doLockLookupBatch.handler);
router.post("/doGetModelsByMake", handler_doGetModelsByMake.handler);
router.get("/:licencePlateCountry/:licencePlateProvince/:licencePlateNumber", handler_view.handler);
module.exports = router;
