import { Router } from "express";

import * as handler_doGetLicencePlates from "../handlers/plates-post/doGetLicencePlates";
import * as handler_doGetUnreceivedLicencePlateLookupBatches from "../handlers/plates-post/doGetUnreceivedLicencePlateLookupBatches";
import * as handler_doGetLookupBatch from "../handlers/plates-post/doGetLookupBatch";
import * as handler_doCreateLookupBatch from "../handlers/plates-post/doCreateLookupBatch";
import * as handler_doAddLicencePlateToLookupBatch from "../handlers/plates-post/doAddLicencePlateToLookupBatch";
import * as handler_doAddAllLicencePlatesToLookupBatch from "../handlers/plates-post/doAddAllLicencePlatesToLookupBatch";
import * as handler_doRemoveLicencePlateFromLookupBatch from "../handlers/plates-post/doRemoveLicencePlateFromLookupBatch";
import * as handler_doClearLookupBatch from "../handlers/plates-post/doClearLookupBatch";
import * as handler_doLockLookupBatch from "../handlers/plates-post/doLockLookupBatch";

import * as handler_doGetModelsByMake from "../handlers/plates-post/doGetModelsByMake";

import * as handler_view from "../handlers/plates-get/view";


const router = Router();


router.get("/", (_req, res) => {
  res.render("plate-search", {
    headTitle: "Licence Plates"
  });
});

router.post("/doGetLicencePlates",
  handler_doGetLicencePlates.handler);


// Lookup Batches


router.post("/doGetUnreceivedLicencePlateLookupBatches",
  handler_doGetUnreceivedLicencePlateLookupBatches.handler);

router.post("/doCreateLookupBatch",
  handler_doCreateLookupBatch.handler);

router.post("/doGetLookupBatch",
  handler_doGetLookupBatch.handler);

router.post("/doAddLicencePlateToLookupBatch",
  handler_doAddLicencePlateToLookupBatch.handler);

router.post("/doAddAllLicencePlatesToLookupBatch",
  handler_doAddAllLicencePlatesToLookupBatch.handler);

router.post("/doRemoveLicencePlateFromLookupBatch",
  handler_doRemoveLicencePlateFromLookupBatch.handler);

router.post("/doClearLookupBatch",
  handler_doClearLookupBatch.handler);

router.post("/doLockLookupBatch",
  handler_doLockLookupBatch.handler);


router.post("/doGetModelsByMake",
  handler_doGetModelsByMake.handler);


// View


router.get("/:licencePlateCountry/:licencePlateProvince/:licencePlateNumber", handler_view.handler);


export = router;
