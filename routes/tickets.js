"use strict";
const express_1 = require("express");
const configFns = require("../helpers/configFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const handler_doGetTickets = require("../handlers/tickets-post/doGetTickets");
const handler_reconcile = require("../handlers/tickets-get/reconcile");
const handler_doAcknowledgeLookupError = require("../handlers/tickets-post/doAcknowledgeLookupError");
const handler_doQuickReconcileMatches = require("../handlers/tickets-post/doQuickReconcileMatches");
const handler_doReconcileAsMatch = require("../handlers/tickets-post/doReconcileAsMatch");
const handler_doReconcileAsError = require("../handlers/tickets-post/doReconcileAsError");
const parkingDB = require("../helpers/parkingDB");
const parkingDB_getParkingTicket = require("../helpers/parkingDB/getParkingTicket");
const parkingDB_getParkingTicketID = require("../helpers/parkingDB/getParkingTicketID");
const parkingDB_createParkingTicket = require("../helpers/parkingDB/createParkingTicket");
const parkingDB_updateParkingTicket = require("../helpers/parkingDB/updateParkingTicket");
const parkingDB_resolveParkingTicket = require("../helpers/parkingDB/resolveParkingTicket");
const parkingDB_unresolveParkingTicket = require("../helpers/parkingDB/unresolveParkingTicket");
const parkingDB_deleteParkingTicket = require("../helpers/parkingDB/deleteParkingTicket");
const parkingDB_restoreParkingTicket = require("../helpers/parkingDB/restoreParkingTicket");
const parkingDB_parkingTicketRemarks = require("../helpers/parkingDB/parkingTicketRemarks");
const parkingDB_parkingTicketStatuses = require("../helpers/parkingDB/parkingTicketStatuses");
const parkingDB_getLastTenConvictionBatches = require("../helpers/parkingDB/getLastTenConvictionBatches");
const parkingDB_getConvictionBatch = require("../helpers/parkingDB/getConvictionBatch");
const parkingDB_createConvictionBatch = require("../helpers/parkingDB/createConvictionBatch");
const parkingDB_addParkingTicketToConvictionBatch = require("../helpers/parkingDB/addParkingTicketToConvictionBatch");
const parkingDB_lockConvictionBatch = require("../helpers/parkingDB/lockConvictionBatch");
const parkingDB_unlockConvictionBatch = require("../helpers/parkingDB/unlockConvictionBatch");
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
router.post("/doGetRecentConvictionBatches", (req, res) => {
    if (!(userFns_1.userCanUpdate(req) || userFns_1.userIsOperator(req))) {
        return userFns_1.forbiddenJSON(res);
    }
    const batches = parkingDB_getLastTenConvictionBatches.getLastTenConvictionBatches();
    return res.json(batches);
});
router.post("/doGetConvictionBatch", (req, res) => {
    if (!(userFns_1.userCanUpdate(req) || userFns_1.userIsOperator(req))) {
        return userFns_1.forbiddenJSON(res);
    }
    const batch = parkingDB_getConvictionBatch.getConvictionBatch(req.body.batchID);
    return res.json(batch);
});
router.post("/doCreateConvictionBatch", (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const batchResult = parkingDB_createConvictionBatch.createConvictionBatch(req.session);
    return res.json(batchResult);
});
router.post("/doAddTicketToConvictionBatch", (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const batchID = req.body.batchID;
    const ticketID = req.body.ticketID;
    const result = parkingDB_addParkingTicketToConvictionBatch.addParkingTicketToConvictionBatch(batchID, ticketID, req.session);
    if (result.success) {
        result.batch = parkingDB_getConvictionBatch.getConvictionBatch(batchID);
    }
    return res.json(result);
});
router.post("/doLockConvictionBatch", (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const batchID = req.body.batchID;
    const result = parkingDB_lockConvictionBatch.lockConvictionBatch(batchID, req.session);
    return res.json(result);
});
router.post("/doUnlockConvictionBatch", (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const batchID = req.body.batchID;
    const success = parkingDB_unlockConvictionBatch.unlockConvictionBatch(batchID, req.session);
    return res.json({ success });
});
router.get(["/new", "/new/:ticketNumber"], (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return res.redirect("/tickets/?error=accessDenied");
    }
    const ticketNumber = req.params.ticketNumber;
    const vehicleMakeModelDatalist = parkingDB.getRecentParkingTicketVehicleMakeModelValues();
    return res.render("ticket-edit", {
        headTitle: "New Ticket",
        isCreate: true,
        ticket: {
            ticketNumber,
            licencePlateCountry: configFns.getProperty("defaults.country"),
            licencePlateProvince: configFns.getProperty("defaults.province")
        },
        issueDateMaxString: dateTimeFns.dateToString(new Date()),
        vehicleMakeModelDatalist
    });
});
router.post("/doCreateTicket", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_createParkingTicket.createParkingTicket(req.body, req.session);
    if (result.success) {
        const ticketNumber = req.body.ticketNumber;
        result.nextTicketNumber = configFns.getProperty("parkingTickets.ticketNumber.nextTicketNumberFn")(ticketNumber);
    }
    return res.json(result);
});
router.post("/doUpdateTicket", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_updateParkingTicket.updateParkingTicket(req.body, req.session);
    return res.json(result);
});
router.post("/doDeleteTicket", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_deleteParkingTicket.deleteParkingTicket(req.body.ticketID, req.session);
    return res.json(result);
});
router.post("/doResolveTicket", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_resolveParkingTicket.resolveParkingTicket(req.body.ticketID, req.session);
    return res.json(result);
});
router.post("/doUnresolveTicket", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_unresolveParkingTicket.unresolveParkingTicket(req.body.ticketID, req.session);
    return res.json(result);
});
router.post("/doRestoreTicket", (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_restoreParkingTicket.restoreParkingTicket(req.body.ticketID, req.session);
    return res.json(result);
});
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
