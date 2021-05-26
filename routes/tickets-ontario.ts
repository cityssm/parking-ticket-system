import { Router } from "express";

import * as permissionHandlers from "../handlers/permissions.js";

import handler_convict from "../handlers/tickets-ontario-get/convict.js";
import handler_convictDownload from "../handlers/tickets-ontario-get/convictDownload.js";

import handler_doAddAllTicketsToConvictionBatch from "../handlers/tickets-ontario-post/doAddAllTicketsToConvictionBatch.js";
import handler_doClearConvictionBatch from "../handlers/tickets-ontario-post/doClearConvictionBatch.js";
import handler_doRemoveTicketFromConvictionBatch from "../handlers/tickets-ontario-post/doRemoveTicketFromConvictionBatch.js";


export const router = Router();


router.get("/convict",
  permissionHandlers.updateOrOperatorGetHandler,
  handler_convict.handler);


router.get("/convict/:batchID",
  permissionHandlers.updateOrOperatorGetHandler,
  handler_convictDownload.handler);


router.post("/doAddAllTicketsToConvictionBatch",
  permissionHandlers.updatePostHandler,
  handler_doAddAllTicketsToConvictionBatch.handler);


router.post("/doClearConvictionBatch",
  permissionHandlers.updatePostHandler,
  handler_doClearConvictionBatch.handler);


router.post("/doRemoveTicketFromConvictionBatch",
  permissionHandlers.updatePostHandler,
  handler_doRemoveTicketFromConvictionBatch.handler);


export default router;
