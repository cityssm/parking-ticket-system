import { Router } from "express";

import * as permissionHandlers from "../handlers/permissions";

import * as handler_mtoExport from "../handlers/plates-ontario-get/mtoExport";
import * as handler_mtoExportDownload from "../handlers/plates-ontario-get/mtoExportDownload";
import * as handler_doGetPlatesAvailableForMTOLookup from "../handlers/plates-ontario-post/doGetPlatesAvailableForMTOLookup";

import * as handler_mtoImport from "../handlers/plates-ontario-get/mtoImport";
import * as handler_doMTOImportUpload from "../handlers/plates-ontario-post/doMTOImportUpload";


const router = Router();


router.get("/mtoExport",
  permissionHandlers.updateOrOperatorGetHandler,
  handler_mtoExport.handler);

router.post("/doGetPlatesAvailableForMTOLookup",
  permissionHandlers.updatePostHandler,
  handler_doGetPlatesAvailableForMTOLookup.handler);

router.get("/mtoExport/:batchID",
  permissionHandlers.updateOrOperatorGetHandler,
  handler_mtoExportDownload.handler);

router.get("/mtoImport",
  permissionHandlers.updateOrOperatorGetHandler,
  handler_mtoImport.handler);

router.post("/doMTOImportUpload",
  permissionHandlers.updateOrOperatorPostHandler,
  handler_doMTOImportUpload.uploadHandler,
  handler_doMTOImportUpload.handler);


export = router;
