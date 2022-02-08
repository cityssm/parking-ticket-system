import { Router } from "express";

import * as permissionHanders from "../handlers/permissions.js";

// Tickets
import handler_new from "../handlers/tickets-get/new.js";
import handler_view from "../handlers/tickets-get/view.js";
import handler_print from "../handlers/tickets-get/print.js";
import handler_edit from "../handlers/tickets-get/edit.js";
import handler_byTicketNumber from "../handlers/tickets-get/byTicketNumber.js";

import handler_doGetTickets from "../handlers/tickets-post/doGetTickets.js";
import handler_doCreateTicket from "../handlers/tickets-post/doCreateTicket.js";
import handler_doUpdateTicket from "../handlers/tickets-post/doUpdateTicket.js";
import handler_doResolveTicket from "../handlers/tickets-post/doResolveTicket.js";
import handler_doUnresolveTicket from "../handlers/tickets-post/doUnresolveTicket.js";
import handler_doDeleteTicket from "../handlers/tickets-post/doDeleteTicket.js";
import handler_doRestoreTicket from "../handlers/tickets-post/doRestoreTicket.js";

// Remarks
import handler_doGetRemarks from "../handlers/tickets-post/doGetRemarks.js";
import handler_doAddRemark from "../handlers/tickets-post/doAddRemark.js";
import handler_doUpdateRemark from "../handlers/tickets-post/doUpdateRemark.js";
import handler_doDeleteRemark from "../handlers/tickets-post/doDeleteRemark.js";

// Statuses
import handler_doGetStatuses from "../handlers/tickets-post/doGetStatuses.js";
import handler_doAddStatus from "../handlers/tickets-post/doAddStatus.js";
import handler_doUpdateStatus from "../handlers/tickets-post/doUpdateStatus.js";
import handler_doDeleteStatus from "../handlers/tickets-post/doDeleteStatus.js";

// Reconciliation
import handler_reconcile from "../handlers/tickets-get/reconcile.js";
import handler_doAcknowledgeLookupError from "../handlers/tickets-post/doAcknowledgeLookupError.js";
import handler_doQuickReconcileMatches from "../handlers/tickets-post/doQuickReconcileMatches.js";
import handler_doReconcileAsMatch from "../handlers/tickets-post/doReconcileAsMatch.js";
import handler_doReconcileAsError from "../handlers/tickets-post/doReconcileAsError.js";

// Convictions
import handler_doGetRecentConvictionBatches from "../handlers/tickets-post/doGetRecentConvictionBatches.js";
import handler_doGetConvictionBatch from "../handlers/tickets-post/doGetConvictionBatch.js";
import handler_doCreateConvictionBatch from "../handlers/tickets-post/doCreateConvictionBatch.js";
import handler_doAddTicketToConvictionBatch from "../handlers/tickets-post/doAddTicketToConvictionBatch.js";
import handler_doLockConvictionBatch from "../handlers/tickets-post/doLockConvictionBatch.js";
import handler_doUnlockConvictionBatch from "../handlers/tickets-post/doUnlockConvictionBatch.js";


export const router = Router();


/*
 * Ticket Search
 */

router.get("/", (_request, response) => {
  response.render("ticket-search", {
    headTitle: "Parking Tickets"
  });
});

router.post("/doGetTickets",
  handler_doGetTickets);

/*
 * Ownership Reconciliation
 */

router.get("/reconcile",
  permissionHanders.updateGetHandler,
  handler_reconcile);

router.post("/doAcknowledgeLookupError",
  permissionHanders.updatePostHandler,
  handler_doAcknowledgeLookupError);

router.post("/doReconcileAsMatch",
  permissionHanders.updatePostHandler,
  handler_doReconcileAsMatch);

router.post("/doReconcileAsError",
  permissionHanders.updatePostHandler,
  handler_doReconcileAsError);

router.post("/doQuickReconcileMatches",
  permissionHanders.updatePostHandler,
  handler_doQuickReconcileMatches);

/*
 * Ticket Convictions
 */

router.post("/doGetRecentConvictionBatches",
  permissionHanders.updateOrOperatorPostHandler,
  handler_doGetRecentConvictionBatches);

router.post("/doGetConvictionBatch",
  permissionHanders.updateOrOperatorPostHandler,
  handler_doGetConvictionBatch);

router.post("/doCreateConvictionBatch",
  permissionHanders.updatePostHandler,
  handler_doCreateConvictionBatch);

router.post("/doAddTicketToConvictionBatch",
  permissionHanders.updatePostHandler,
  handler_doAddTicketToConvictionBatch);

router.post("/doLockConvictionBatch",
  permissionHanders.updatePostHandler,
  handler_doLockConvictionBatch);

router.post("/doUnlockConvictionBatch",
  permissionHanders.updatePostHandler,
  handler_doUnlockConvictionBatch);

/*
 * New Ticket
 */

router.get(["/new", "/new/:ticketNumber"],
  permissionHanders.updateGetHandler,
  handler_new);

router.post("/doCreateTicket",
  permissionHanders.updatePostHandler,
  handler_doCreateTicket);

router.post("/doUpdateTicket",
  permissionHanders.updatePostHandler,
  handler_doUpdateTicket);

router.post("/doDeleteTicket",
  permissionHanders.updatePostHandler,
  handler_doDeleteTicket);

router.post("/doResolveTicket",
  permissionHanders.updatePostHandler,
  handler_doResolveTicket);

router.post("/doUnresolveTicket",
  permissionHanders.updatePostHandler,
  handler_doUnresolveTicket);

router.post("/doRestoreTicket",
  permissionHanders.updatePostHandler,
  handler_doRestoreTicket);

/*
 * Ticket Remarks
 */

router.post("/doGetRemarks",
  handler_doGetRemarks);

router.post("/doAddRemark",
  permissionHanders.updatePostHandler,
  handler_doAddRemark);

router.post("/doUpdateRemark",
  permissionHanders.updatePostHandler,
  handler_doUpdateRemark);

router.post("/doDeleteRemark",
  permissionHanders.updatePostHandler,
  handler_doDeleteRemark);

/*
 * Ticket Statuses
 */

router.post("/doGetStatuses",
  handler_doGetStatuses);

router.post("/doAddStatus",
  permissionHanders.updatePostHandler,
  handler_doAddStatus);

router.post("/doUpdateStatus",
  permissionHanders.updatePostHandler,
  handler_doUpdateStatus);

router.post("/doDeleteStatus",
  permissionHanders.updatePostHandler,
  handler_doDeleteStatus);

/*
 * Ticket View
 */

router.get("/:ticketID",
  handler_view);

router.get("/:ticketID/print",
  handler_print);

router.get("/byTicketNumber/:ticketNumber",
  handler_byTicketNumber);

/*
 * Ticket Edit
 */

router.get("/:ticketID/edit",
  permissionHanders.updateGetHandler,
  handler_edit);


export default router;
