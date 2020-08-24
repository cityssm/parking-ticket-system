import { Router } from "express";

import * as handler_convict from "../handlers/tickets-ontario-get/convict";
import * as handler_convictDownload from "../handlers/tickets-ontario-get/convictDownload";

import * as handler_doAddAllTicketsToConvictionBatch from "../handlers/tickets-ontario-post/doAddAllTicketsToConvictionBatch";
import * as handler_doClearConvictionBatch from "../handlers/tickets-ontario-post/doClearConvictionBatch";
import * as handler_doRemoveTicketFromConvictionBatch from "../handlers/tickets-ontario-post/doRemoveTicketFromConvictionBatch";


const router = Router();


router.get("/convict",
  handler_convict.handler);


router.get("/convict/:batchID",
  handler_convictDownload.handler);


router.post("/doAddAllTicketsToConvictionBatch",
  handler_doAddAllTicketsToConvictionBatch.handler);


router.post("/doClearConvictionBatch",
  handler_doClearConvictionBatch.handler);


router.post("/doRemoveTicketFromConvictionBatch",
  handler_doRemoveTicketFromConvictionBatch.handler);


export = router;
