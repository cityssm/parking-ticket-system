import { Router } from "express";

import * as permissionHandlers from "../handlers/permissions.js";

import handler_mtoExport from "../handlers/plates-ontario-get/mtoExport.js";
import handler_mtoExportDownload from "../handlers/plates-ontario-get/mtoExportDownload.js";
import handler_doGetPlatesAvailableForMTOLookup from "../handlers/plates-ontario-post/doGetPlatesAvailableForMTOLookup.js";

import handler_mtoImport from "../handlers/plates-ontario-get/mtoImport.js";
import handler_doMTOImportUpload from "../handlers/plates-ontario-post/doMTOImportUpload.js";


export const router = Router();


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


export default router;
