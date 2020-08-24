import { Router } from "express";

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
  handler_reconcile.handler);

router.post("/doAcknowledgeLookupError",
  handler_doAcknowledgeLookupError.handler);

router.post("/doReconcileAsMatch",
  handler_doReconcileAsMatch.handler);

router.post("/doReconcileAsError",
  handler_doReconcileAsError.handler);

router.post("/doQuickReconcileMatches",
  handler_doQuickReconcileMatches.handler);

/*
 * Ticket Convictions
 */

router.post("/doGetRecentConvictionBatches",
  handler_doGetRecentConvictionBatches.handler);

router.post("/doGetConvictionBatch",
  handler_doGetConvictionBatch.handler);

router.post("/doCreateConvictionBatch",
  handler_doCreateConvictionBatch.handler);

router.post("/doAddTicketToConvictionBatch",
  handler_doAddTicketToConvictionBatch.handler);

router.post("/doLockConvictionBatch",
  handler_doLockConvictionBatch.handler);

router.post("/doUnlockConvictionBatch",
  handler_doUnlockConvictionBatch.handler);

/*
 * New Ticket
 */

router.get(["/new", "/new/:ticketNumber"],
  handler_new.handler);

router.post("/doCreateTicket",
  handler_doCreateTicket.handler);

router.post("/doUpdateTicket",
  handler_doUpdateTicket.handler);

router.post("/doDeleteTicket",
  handler_doDeleteTicket.handler);

router.post("/doResolveTicket",
  handler_doResolveTicket.handler);

router.post("/doUnresolveTicket",
  handler_doUnresolveTicket.handler);

router.post("/doRestoreTicket",
  handler_doRestoreTicket.handler);

/*
 * Ticket Remarks
 */

router.post("/doGetRemarks",
  handler_doGetRemarks.handler);

router.post("/doAddRemark",
  handler_doAddRemark.handler);

router.post("/doUpdateRemark",
  handler_doUpdateRemark.handler);

router.post("/doDeleteRemark",
  handler_doDeleteRemark.handler);

/*
 * Ticket Statuses
 */

router.post("/doGetStatuses",
  handler_doGetStatuses.handler);

router.post("/doAddStatus",
  handler_doAddStatus.handler);

router.post("/doUpdateStatus",
  handler_doUpdateStatus.handler);

router.post("/doDeleteStatus",
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
  handler_edit.handler);


export = router;
