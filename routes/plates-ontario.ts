import { Router } from "express";
const router = Router();

import * as mtoFns from "../helpers/mtoFns";

import * as parkingDBOntario from "../helpers/parkingDB-ontario";
import * as parkingDBLookup from "../helpers/parkingDB-lookup";

import * as multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage });


router.get("/mtoExport", function(req, res) {

  if (!(req.session.user.userProperties.canUpdate || req.session.user.userProperties.isOperator)) {
    res.redirect("/plates/?error=accessDenied");
    return;
  }

  const latestUnlockedBatch = parkingDBLookup.getLicencePlateLookupBatch(-1);

  res.render("mto-plateExport", {
    headTitle: "MTO Licence Plate Export",
    batch: latestUnlockedBatch
  });

});

router.post("/doGetPlatesAvailableForMTOLookup", function(req, res) {

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

  const availablePlates = parkingDBOntario.getLicencePlatesAvailableForMTOLookupBatch(batchID, issueDaysAgo);
  res.json(availablePlates);

});

router.get("/mtoExport/:batchID", function(req, res) {

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

router.get("/mtoImport", function(req, res) {

  if (!(req.session.user.userProperties.canUpdate || req.session.user.userProperties.isOperator)) {
    res.redirect("/plates/?error=accessDenied");
    return;
  }

  const unreceivedBatches = parkingDBLookup.getUnreceivedLicencePlateLookupBatches(false);

  res.render("mto-plateImport", {
    headTitle: "MTO Licence Plate Ownership Import",
    batches: unreceivedBatches
  });

});

router.post("/doMTOImportUpload", upload.single("importFile"), function(req, res) {

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

export = router;
