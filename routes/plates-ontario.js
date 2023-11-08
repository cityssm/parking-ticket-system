import { Router } from 'express';
import * as permissionHandlers from '../handlers/permissions.js';
import handler_mtoExport from '../handlers/plates-ontario-get/mtoExport.js';
import handler_mtoExportDownload from '../handlers/plates-ontario-get/mtoExportDownload.js';
import handler_mtoImport from '../handlers/plates-ontario-get/mtoImport.js';
import handler_doGetTicketsAvailableForMTOLookup from '../handlers/plates-ontario-post/doGetTicketsAvailableForMTOLookup.js';
import * as handler_doMTOImportUpload from '../handlers/plates-ontario-post/doMTOImportUpload.js';
export const router = Router();
router.get('/mtoExport', permissionHandlers.updateOrOperatorGetHandler, handler_mtoExport);
router.post('/doGetParkingTicketsAvailableForMTOLookup', permissionHandlers.updatePostHandler, handler_doGetTicketsAvailableForMTOLookup);
router.get('/mtoExport/:batchId', permissionHandlers.updateOrOperatorGetHandler, handler_mtoExportDownload);
router.get('/mtoImport', permissionHandlers.updateOrOperatorGetHandler, handler_mtoImport);
router.post('/doMTOImportUpload', permissionHandlers.updateOrOperatorPostHandler, handler_doMTOImportUpload.uploadHandler, handler_doMTOImportUpload.handler);
export default router;
