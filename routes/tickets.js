"use strict";
const express_1 = require("express");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const handler_new = require("../handlers/tickets-get/new");
const handler_doGetTickets = require("../handlers/tickets-post/doGetTickets");
const handler_doCreateTicket = require("../handlers/tickets-post/doCreateTicket");
const handler_doUpdateTicket = require("../handlers/tickets-post/doUpdateTicket");
const handler_doResolveTicket = require("../handlers/tickets-post/doResolveTicket");
const handler_doUnresolveTicket = require("../handlers/tickets-post/doUnresolveTicket");
const handler_doDeleteTicket = require("../handlers/tickets-post/doDeleteTicket");
const handler_doRestoreTicket = require("../handlers/tickets-post/doRestoreTicket");
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
const parkingDB = require("../helpers/parkingDB");
const parkingDB_getParkingTicket = require("../helpers/parkingDB/getParkingTicket");
const parkingDB_getParkingTicketID = require("../helpers/parkingDB/getParkingTicketID");
const parkingDB_parkingTicketRemarks = require("../helpers/parkingDB/parkingTicketRemarks");
const parkingDB_parkingTicketStatuses = require("../helpers/parkingDB/parkingTicketStatuses");
const userFns_1 = require("../helpers/userFns");
const router = express_1.Router();
router.get("/", (_req, res) => {
    res.render("ticket-search", {
        headTitle: "Parking Tickets"
    });
});
router.post("/doGetTickets", handler_doGetTickets.handler);
router.get("/reconcile", handler_reconcile.handler);
router.post("/doAcknowledgeLookupError", handler_doAcknowledgeLookupError.handler);
router.post("/doReconcileAsMatch", handler_doReconcileAsMatch.handler);
router.post("/doReconcileAsError", handler_doReconcileAsError.handler);
router.post("/doQuickReconcileMatches", handler_doQuickReconcileMatches.handler);
router.post("/doGetRecentConvictionBatches", handler_doGetRecentConvictionBatches.handler);
router.post("/doGetConvictionBatch", handler_doGetConvictionBatch.handler);
router.post("/doCreateConvictionBatch", handler_doCreateConvictionBatch.handler);
router.post("/doAddTicketToConvictionBatch", handler_doAddTicketToConvictionBatch.handler);
router.post("/doLockConvictionBatch", handler_doLockConvictionBatch.handler);
router.post("/doUnlockConvictionBatch", handler_doUnlockConvictionBatch.handler);
router.get(["/new", "/new/:ticketNumber"], handler_new.handler);
router.post("/doCreateTicket", handler_doCreateTicket.handler);
router.post("/doUpdateTicket", handler_doUpdateTicket.handler);
router.post("/doDeleteTicket", handler_doDeleteTicket.handler);
router.post("/doResolveTicket", handler_doResolveTicket.handler);
router.post("/doUnresolveTicket", handler_doUnresolveTicket.handler);
router.post("/doRestoreTicket", handler_doRestoreTicket.handler);
router.post("/doGetRemarks", (req, res) => {
    return res.json(parkingDB_parkingTicketRemarks.getParkingTicketRemarks(req.body.ticketID, req.session));
});
router.post("/doAddRemark", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_parkingTicketRemarks.createParkingTicketRemark(req.body, req.session);
    return res.json(result);
});
router.post("/doUpdateRemark", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_parkingTicketRemarks.updateParkingTicketRemark(req.body, req.session);
    return res.json(result);
});
router.post("/doDeleteRemark", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_parkingTicketRemarks.deleteParkingTicketRemark(req.body.ticketID, req.body.remarkIndex, req.session);
    return res.json(result);
});
router.post("/doGetStatuses", (req, res) => {
    return res.json(parkingDB_parkingTicketStatuses.getParkingTicketStatuses(req.body.ticketID, req.session));
});
router.post("/doAddStatus", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_parkingTicketStatuses.createParkingTicketStatus(req.body, req.session, req.body.resolveTicket === "1");
    return res.json(result);
});
router.post("/doUpdateStatus", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_parkingTicketStatuses.updateParkingTicketStatus(req.body, req.session);
    return res.json(result);
});
router.post("/doDeleteStatus", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_parkingTicketStatuses.deleteParkingTicketStatus(req.body.ticketID, req.body.statusIndex, req.session);
    return res.json(result);
});
router.get("/:ticketID", (req, res) => {
    const ticketID = parseInt(req.params.ticketID, 10);
    const ticket = parkingDB_getParkingTicket.getParkingTicket(ticketID, req.session);
    if (!ticket) {
        return res.redirect("/tickets/?error=ticketNotFound");
    }
    else if (ticket.recordDelete_timeMillis && !req.session.user.userProperties.isAdmin) {
        return res.redirect("/tickets/?error=accessDenied");
    }
    return res.render("ticket-view", {
        headTitle: "Ticket " + ticket.ticketNumber,
        ticket
    });
});
router.get("/byTicketNumber/:ticketNumber", (req, res) => {
    const ticketNumber = req.params.ticketNumber;
    const ticketID = parkingDB_getParkingTicketID.getParkingTicketID(ticketNumber);
    if (ticketID) {
        res.redirect("/tickets/" + ticketID.toString());
    }
    else {
        res.redirect("/tickets/?error=ticketNotFound");
    }
});
router.get("/:ticketID/edit", (req, res) => {
    const ticketID = parseInt(req.params.ticketID, 10);
    if (!userFns_1.userCanCreate(req)) {
        return res.redirect("/tickets/" + ticketID.toString());
    }
    const ticket = parkingDB_getParkingTicket.getParkingTicket(ticketID, req.session);
    if (!ticket) {
        return res.redirect("/tickets/?error=ticketNotFound");
    }
    else if (!ticket.canUpdate || ticket.resolvedDate || ticket.recordDelete_timeMillis) {
        return res.redirect("/tickets/" + ticketID.toString() + "/?error=accessDenied");
    }
    const vehicleMakeModelDatalist = parkingDB.getRecentParkingTicketVehicleMakeModelValues();
    return res.render("ticket-edit", {
        headTitle: "Ticket " + ticket.ticketNumber,
        isCreate: false,
        ticket,
        issueDateMaxString: dateTimeFns.dateToString(new Date()),
        vehicleMakeModelDatalist
    });
});
module.exports = router;
