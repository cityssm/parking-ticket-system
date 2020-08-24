import { Router } from "express";

import * as handler_mtoExport from "../handlers/plates-ontario-get/mtoExport";
import * as handler_mtoExportDownload from "../handlers/plates-ontario-get/mtoExportDownload";
import * as handler_doGetPlatesAvailableForMTOLookup from "../handlers/plates-ontario-post/doGetPlatesAvailableForMTOLookup";

import * as handler_mtoImport from "../handlers/plates-ontario-get/mtoImport";
import * as handler_doMTOImportUpload from "../handlers/plates-ontario-post/doMTOImportUpload";


const router = Router();


router.get("/mtoExport",
  handler_mtoExport.handler);

router.post("/doGetPlatesAvailableForMTOLookup",
  handler_doGetPlatesAvailableForMTOLookup.handler);

router.get("/mtoExport/:batchID",
  handler_mtoExportDownload.handler);

router.get("/mtoImport",
  handler_mtoImport.handler);

router.post("/doMTOImportUpload",
  handler_doMTOImportUpload.uploadHandler,
  handler_doMTOImportUpload.handler);


export = router;
