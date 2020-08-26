import { Router } from "express";

import * as permissionHanders from "../handlers/permissions";

// Tickets
import * as handler_new from "../handlers/tickets-get/new";
import * as handler_view from "../handlers/tickets-get/view";
import * as handler_edit from "../handlers/tickets-get/edit";
import * as handler_byTicketNumber from "../handlers/tickets-get/byTicketNumber";

import * as handler_doGetTickets from "../handlers/tickets-post/doGetTickets";
import * as handler_doCreateTicket from "../handlers/tickets-post/doCreateTicket";
import * as handler_doUpdateTicket from "../handlers/tickets-post/doUpdateTicket";
import * as handler_doResolveTicket from "../handlers/tickets-post/doResolveTicket";
import * as handler_doUnresolveTicket from "../handlers/tickets-post/doUnresolveTicket";
import * as handler_doDeleteTicket from "../handlers/tickets-post/doDeleteTicket";
import * as handler_doRestoreTicket from "../handlers/tickets-post/doRestoreTicket";

// Remarks
import * as handler_doGetRemarks from "../handlers/tickets-post/doGetRemarks";
import * as handler_doAddRemark from "../handlers/tickets-post/doAddRemark";
import * as handler_doUpdateRemark from "../handlers/tickets-post/doUpdateRemark";
import * as handler_doDeleteRemark from "../handlers/tickets-post/doDeleteRemark";

// Statuses
import * as handler_doGetStatuses from "../handlers/tickets-post/doGetStatuses";
import * as handler_doAddStatus from "../handlers/tickets-post/doAddStatus";
import * as handler_doUpdateStatus from "../handlers/tickets-post/doUpdateStatus";
import * as handler_doDeleteStatus from "../handlers/tickets-post/doDeleteStatus";

// Reconciliation
import * as handler_reconcile from "../handlers/tickets-get/reconcile";
import * as handler_doAcknowledgeLookupError from "../handlers/tickets-post/doAcknowledgeLookupError";
import * as handler_doQuickReconcileMatches from "../handlers/tickets-post/doQuickReconcileMatches";
import * as handler_doReconcileAsMatch from "../handlers/tickets-post/doReconcileAsMatch";
import * as handler_doReconcileAsError from "../handlers/tickets-post/doReconcileAsError";

// Convictions
import * as handler_doGetRecentConvictionBatches from "../handlers/tickets-post/doGetRecentConvictionBatches";
import * as handler_doGetConvictionBatch from "../handlers/tickets-post/doGetConvictionBatch";
import * as handler_doCreateConvictionBatch from "../handlers/tickets-post/doCreateConvictionBatch";
import * as handler_doAddTicketToConvictionBatch from "../handlers/tickets-post/doAddTicketToConvictionBatch";
import * as handler_doLockConvictionBatch from "../handlers/tickets-post/doLockConvictionBatch";
import * as handler_doUnlockConvictionBatch from "../handlers/tickets-post/doUnlockConvictionBatch";


const router = Router();


/*
 * Ticket Search
 */

router.get("/", (_req, res) => {
  res.render("ticket-search", {
    headTitle: "Parking Tickets"
  });
});

router.post("/doGetTickets",
  handler_doGetTickets.handler);

/*
 * Ownership Reconciliation
 */

router.get("/reconcile",
  permissionHanders.updateGetHandler,
  handler_reconcile.handler);

router.post("/doAcknowledgeLookupError",
  permissionHanders.updatePostHandler,
  handler_doAcknowledgeLookupError.handler);

router.post("/doReconcileAsMatch",
  permissionHanders.updatePostHandler,
  handler_doReconcileAsMatch.handler);

router.post("/doReconcileAsError",
  permissionHanders.updatePostHandler,
  handler_doReconcileAsError.handler);

router.post("/doQuickReconcileMatches",
  permissionHanders.updatePostHandler,
  handler_doQuickReconcileMatches.handler);

/*
 * Ticket Convictions
 */

router.post("/doGetRecentConvictionBatches",
  permissionHanders.updateOrOperatorPostHandler,
  handler_doGetRecentConvictionBatches.handler);

router.post("/doGetConvictionBatch",
  permissionHanders.updateOrOperatorPostHandler,
  handler_doGetConvictionBatch.handler);

router.post("/doCreateConvictionBatch",
  permissionHanders.updatePostHandler,
  handler_doCreateConvictionBatch.handler);

router.post("/doAddTicketToConvictionBatch",
  permissionHanders.updatePostHandler,
  handler_doAddTicketToConvictionBatch.handler);

router.post("/doLockConvictionBatch",
  permissionHanders.updatePostHandler,
  handler_doLockConvictionBatch.handler);

router.post("/doUnlockConvictionBatch",
  permissionHanders.updatePostHandler,
  handler_doUnlockConvictionBatch.handler);

/*
 * New Ticket
 */

router.get(["/new", "/new/:ticketNumber"],
  permissionHanders.createGetHandler,
  handler_new.handler);

router.post("/doCreateTicket",
  permissionHanders.createPostHandler,
  handler_doCreateTicket.handler);

router.post("/doUpdateTicket",
  permissionHanders.createPostHandler,
  handler_doUpdateTicket.handler);

router.post("/doDeleteTicket",
  permissionHanders.createPostHandler,
  handler_doDeleteTicket.handler);

router.post("/doResolveTicket",
  permissionHanders.createPostHandler,
  handler_doResolveTicket.handler);

router.post("/doUnresolveTicket",
  permissionHanders.createPostHandler,
  handler_doUnresolveTicket.handler);

router.post("/doRestoreTicket",
  permissionHanders.updatePostHandler,
  handler_doRestoreTicket.handler);

/*
 * Ticket Remarks
 */

router.post("/doGetRemarks",
  handler_doGetRemarks.handler);

router.post("/doAddRemark",
  permissionHanders.createPostHandler,
  handler_doAddRemark.handler);

router.post("/doUpdateRemark",
  permissionHanders.createPostHandler,
  handler_doUpdateRemark.handler);

router.post("/doDeleteRemark",
  permissionHanders.createPostHandler,
  handler_doDeleteRemark.handler);

/*
 * Ticket Statuses
 */

router.post("/doGetStatuses",
  handler_doGetStatuses.handler);

router.post("/doAddStatus",
  permissionHanders.createPostHandler,
  handler_doAddStatus.handler);

router.post("/doUpdateStatus",
  permissionHanders.createPostHandler,
  handler_doUpdateStatus.handler);

router.post("/doDeleteStatus",
  permissionHanders.createPostHandler,
  handler_doDeleteStatus.handler);

/*
 * Ticket View
 */

router.get("/:ticketID",
  handler_view.handler);

router.get("/byTicketNumber/:ticketNumber",
  handler_byTicketNumber.handler);

/*
 * Ticket Edit
 */

router.get("/:ticketID/edit",
  permissionHanders.createGetHandler,
  handler_edit.handler);


export = router;
