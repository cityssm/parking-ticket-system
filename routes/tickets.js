"use strict";
const express_1 = require("express");
const permissionHanders = require("../handlers/permissions");
const handler_new = require("../handlers/tickets-get/new");
const handler_view = require("../handlers/tickets-get/view");
const handler_edit = require("../handlers/tickets-get/edit");
const handler_byTicketNumber = require("../handlers/tickets-get/byTicketNumber");
const handler_doGetTickets = require("../handlers/tickets-post/doGetTickets");
const handler_doCreateTicket = require("../handlers/tickets-post/doCreateTicket");
const handler_doUpdateTicket = require("../handlers/tickets-post/doUpdateTicket");
const handler_doResolveTicket = require("../handlers/tickets-post/doResolveTicket");
const handler_doUnresolveTicket = require("../handlers/tickets-post/doUnresolveTicket");
const handler_doDeleteTicket = require("../handlers/tickets-post/doDeleteTicket");
const handler_doRestoreTicket = require("../handlers/tickets-post/doRestoreTicket");
const handler_doGetRemarks = require("../handlers/tickets-post/doGetRemarks");
const handler_doAddRemark = require("../handlers/tickets-post/doAddRemark");
const handler_doUpdateRemark = require("../handlers/tickets-post/doUpdateRemark");
const handler_doDeleteRemark = require("../handlers/tickets-post/doDeleteRemark");
const handler_doGetStatuses = require("../handlers/tickets-post/doGetStatuses");
const handler_doAddStatus = require("../handlers/tickets-post/doAddStatus");
const handler_doUpdateStatus = require("../handlers/tickets-post/doUpdateStatus");
const handler_doDeleteStatus = require("../handlers/tickets-post/doDeleteStatus");
const handler_reconcile = require("../handlers/tickets-get/reconcile");
const handler_doAcknowledgeLookupError = require("../handlers/tickets-post/doAcknowledgeLookupError");
const handler_doQuickReconcileMatches = require("../handlers/tickets-post/doQuickReconcileMatches");
const handler_doReconcileAsMatch = require("../handlers/tickets-post/doReconcileAsMatch");
const handler_doReconcileAsError = require("../handlers/tickets-post/doReconcileAsError");
const handler_doGetRecentConvictionBatches = require("../handlers/tickets-post/doGetRecentConvictionBatches");
const handler_doGetConvictionBatch = require("../handlers/tickets-post/doGetConvictionBatch");
const handler_doCreateConvictionBatch = require("../handlers/tickets-post/doCreateConvictionBatch");
const handler_doAddTicketToConvictionBatch = require("../handlers/tickets-post/doAddTicketToConvictionBatch");
const handler_doLockConvictionBatch = require("../handlers/tickets-post/doLockConvictionBatch");
const handler_doUnlockConvictionBatch = require("../handlers/tickets-post/doUnlockConvictionBatch");
const router = express_1.Router();
router.get("/", (_req, res) => {
    res.render("ticket-search", {
        headTitle: "Parking Tickets"
    });
});
router.post("/doGetTickets", handler_doGetTickets.handler);
router.get("/reconcile", permissionHanders.updateGetHandler, handler_reconcile.handler);
router.post("/doAcknowledgeLookupError", permissionHanders.updatePostHandler, handler_doAcknowledgeLookupError.handler);
router.post("/doReconcileAsMatch", permissionHanders.updatePostHandler, handler_doReconcileAsMatch.handler);
router.post("/doReconcileAsError", permissionHanders.updatePostHandler, handler_doReconcileAsError.handler);
router.post("/doQuickReconcileMatches", permissionHanders.updatePostHandler, handler_doQuickReconcileMatches.handler);
router.post("/doGetRecentConvictionBatches", permissionHanders.updateOrOperatorPostHandler, handler_doGetRecentConvictionBatches.handler);
router.post("/doGetConvictionBatch", permissionHanders.updateOrOperatorPostHandler, handler_doGetConvictionBatch.handler);
router.post("/doCreateConvictionBatch", permissionHanders.updatePostHandler, handler_doCreateConvictionBatch.handler);
router.post("/doAddTicketToConvictionBatch", permissionHanders.updatePostHandler, handler_doAddTicketToConvictionBatch.handler);
router.post("/doLockConvictionBatch", permissionHanders.updatePostHandler, handler_doLockConvictionBatch.handler);
router.post("/doUnlockConvictionBatch", permissionHanders.updatePostHandler, handler_doUnlockConvictionBatch.handler);
router.get(["/new", "/new/:ticketNumber"], permissionHanders.createGetHandler, handler_new.handler);
router.post("/doCreateTicket", permissionHanders.createPostHandler, handler_doCreateTicket.handler);
router.post("/doUpdateTicket", permissionHanders.createPostHandler, handler_doUpdateTicket.handler);
router.post("/doDeleteTicket", permissionHanders.createPostHandler, handler_doDeleteTicket.handler);
router.post("/doResolveTicket", permissionHanders.createPostHandler, handler_doResolveTicket.handler);
router.post("/doUnresolveTicket", permissionHanders.createPostHandler, handler_doUnresolveTicket.handler);
router.post("/doRestoreTicket", permissionHanders.updatePostHandler, handler_doRestoreTicket.handler);
router.post("/doGetRemarks", handler_doGetRemarks.handler);
router.post("/doAddRemark", permissionHanders.createPostHandler, handler_doAddRemark.handler);
router.post("/doUpdateRemark", permissionHanders.createPostHandler, handler_doUpdateRemark.handler);
router.post("/doDeleteRemark", permissionHanders.createPostHandler, handler_doDeleteRemark.handler);
router.post("/doGetStatuses", handler_doGetStatuses.handler);
router.post("/doAddStatus", permissionHanders.createPostHandler, handler_doAddStatus.handler);
router.post("/doUpdateStatus", permissionHanders.createPostHandler, handler_doUpdateStatus.handler);
router.post("/doDeleteStatus", permissionHanders.createPostHandler, handler_doDeleteStatus.handler);
router.get("/:ticketID", handler_view.handler);
router.get("/byTicketNumber/:ticketNumber", handler_byTicketNumber.handler);
router.get("/:ticketID/edit", permissionHanders.createGetHandler, handler_edit.handler);
module.exports = router;
