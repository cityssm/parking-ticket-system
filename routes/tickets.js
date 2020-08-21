"use strict";
const express_1 = require("express");
const configFns = require("../helpers/configFns");
const ownerFns = require("../helpers/ownerFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const parkingDB = require("../helpers/parkingDB");
const parkingDBLookup = require("../helpers/parkingDB-lookup");
const parkingDBConvict = require("../helpers/parkingDB-convict");
const parkingDB_getParkingTickets = require("../helpers/parkingDB/getParkingTickets");
const parkingDB_getParkingTicket = require("../helpers/parkingDB/getParkingTicket");
const parkingDB_getParkingTicketID = require("../helpers/parkingDB/getParkingTicketID");
const parkingDB_createParkingTicket = require("../helpers/parkingDB/createParkingTicket");
const parkingDB_updateParkingTicket = require("../helpers/parkingDB/updateParkingTicket");
const parkingDB_resolveParkingTicket = require("../helpers/parkingDB/resolveParkingTicket");
const parkingDB_unresolveParkingTicket = require("../helpers/parkingDB/unresolveParkingTicket");
const parkingDB_deleteParkingTicket = require("../helpers/parkingDB/deleteParkingTicket");
const parkingDB_restoreParkingTicket = require("../helpers/parkingDB/restoreParkingTicket");
const parkingDB_getParkingTicketRemarks = require("../helpers/parkingDB/getParkingTicketRemarks");
const parkingDB_createParkingTicketRemark = require("../helpers/parkingDB/createParkingTicketRemark");
const parkingDB_updateParkingTicketRemark = require("../helpers/parkingDB/updateParkingTicketRemark");
const parkingDB_deleteParkingTicketRemark = require("../helpers/parkingDB/deleteParkingTicketRemark");
const parkingDB_getParkingTicketStatuses = require("../helpers/parkingDB/getParkingTicketStatuses");
const parkingDB_createParkingTicketStatus = require("../helpers/parkingDB/createParkingTicketStatus");
const parkingDB_updateParkingTicketStatus = require("../helpers/parkingDB/updateParkingTicketStatus");
const parkingDB_deleteParkingTicketStatus = require("../helpers/parkingDB/deleteParkingTicketStatus");
const parkingDB_getLicencePlateOwner = require("../helpers/parkingDB/getLicencePlateOwner");
const userFns_1 = require("../helpers/userFns");
const router = express_1.Router();
router.get("/", (_req, res) => {
    res.render("ticket-search", {
        headTitle: "Parking Tickets"
    });
});
router.post("/doGetTickets", (req, res) => {
    const queryOptions = {
        limit: req.body.limit,
        offset: req.body.offset,
        ticketNumber: req.body.ticketNumber,
        licencePlateNumber: req.body.licencePlateNumber,
        location: req.body.location
    };
    if (req.body.isResolved !== "") {
        queryOptions.isResolved = req.body.isResolved === "1";
    }
    res.json(parkingDB_getParkingTickets.getParkingTickets(req.session, queryOptions));
});
router.get("/reconcile", (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return res.redirect("/tickets/?error=accessDenied");
    }
    const reconciliationRecords = parkingDBLookup.getOwnershipReconciliationRecords();
    const lookupErrors = parkingDBLookup.getUnacknowledgedLicencePlateLookupErrorLog(-1, -1);
    return res.render("ticket-reconcile", {
        headTitle: "Ownership Reconciliation",
        records: reconciliationRecords,
        errorLog: lookupErrors
    });
});
router.post("/doAcknowledgeLookupError", (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const logEntries = parkingDBLookup.getUnacknowledgedLicencePlateLookupErrorLog(req.body.batchID, req.body.logIndex);
    if (logEntries.length === 0) {
        return res.json({
            success: false,
            message: "Log entry not found.  It may have already been acknowledged."
        });
    }
    const statusResponse = parkingDB_createParkingTicketStatus.createParkingTicketStatus({
        recordType: "status",
        ticketID: logEntries[0].ticketID,
        statusKey: "ownerLookupError",
        statusField: "",
        statusNote: logEntries[0].errorMessage + " (" + logEntries[0].errorCode + ")"
    }, req.session, false);
    if (!statusResponse.success) {
        return res.json({
            success: false,
            message: "Unable to update the status on the parking ticket.  It may have been resolved."
        });
    }
    const success = parkingDBLookup.markLicencePlateLookupErrorLogEntryAcknowledged(req.body.batchID, req.body.logIndex, req.session);
    return res.json({
        success
    });
});
router.post("/doReconcileAsMatch", (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const ownerRecord = parkingDB_getLicencePlateOwner.getLicencePlateOwner(req.body.licencePlateCountry, req.body.licencePlateProvince, req.body.licencePlateNumber, req.body.recordDate);
    if (!ownerRecord) {
        return res.json({
            success: false,
            message: "Ownership record not found."
        });
    }
    const ownerAddress = ownerFns.getFormattedOwnerAddress(ownerRecord);
    const statusResponse = parkingDB_createParkingTicketStatus.createParkingTicketStatus({
        recordType: "status",
        ticketID: parseInt(req.body.ticketID, 10),
        statusKey: "ownerLookupMatch",
        statusField: ownerRecord.recordDate.toString(),
        statusNote: ownerAddress
    }, req.session, false);
    return res.json(statusResponse);
});
router.post("/doReconcileAsError", (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const ownerRecord = parkingDB_getLicencePlateOwner.getLicencePlateOwner(req.body.licencePlateCountry, req.body.licencePlateProvince, req.body.licencePlateNumber, req.body.recordDate);
    if (!ownerRecord) {
        return res.json({
            success: false,
            message: "Ownership record not found."
        });
    }
    const statusResponse = parkingDB_createParkingTicketStatus.createParkingTicketStatus({
        recordType: "status",
        ticketID: parseInt(req.body.ticketID, 10),
        statusKey: "ownerLookupError",
        statusField: ownerRecord.vehicleNCIC,
        statusNote: ""
    }, req.session, false);
    return res.json(statusResponse);
});
router.post("/doQuickReconcileMatches", (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const records = parkingDBLookup.getOwnershipReconciliationRecords();
    const statusRecords = [];
    for (const record of records) {
        if (!record.isVehicleMakeMatch || !record.isLicencePlateExpiryDateMatch) {
            continue;
        }
        const ownerAddress = ownerFns.getFormattedOwnerAddress(record);
        const statusResponse = parkingDB_createParkingTicketStatus.createParkingTicketStatus({
            recordType: "status",
            ticketID: record.ticket_ticketID,
            statusKey: "ownerLookupMatch",
            statusField: record.owner_recordDateString,
            statusNote: ownerAddress
        }, req.session, false);
        if (statusResponse.success) {
            statusRecords.push({
                ticketID: record.ticket_ticketID,
                statusIndex: statusResponse.statusIndex
            });
        }
    }
    return res.json({
        success: true,
        statusRecords
    });
});
router.post("/doGetRecentConvictionBatches", (req, res) => {
    if (!(userFns_1.userCanUpdate(req) || userFns_1.userIsOperator(req))) {
        return userFns_1.forbiddenJSON(res);
    }
    const batches = parkingDBConvict.getLastTenParkingTicketConvictionBatches();
    return res.json(batches);
});
router.post("/doGetConvictionBatch", (req, res) => {
    if (!(userFns_1.userCanUpdate(req) || userFns_1.userIsOperator(req))) {
        return userFns_1.forbiddenJSON(res);
    }
    const batch = parkingDBConvict.getParkingTicketConvictionBatch(req.body.batchID);
    return res.json(batch);
});
router.post("/doCreateConvictionBatch", (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const batchResult = parkingDBConvict.createParkingTicketConvictionBatch(req.session);
    return res.json(batchResult);
});
router.post("/doAddTicketToConvictionBatch", (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const batchID = req.body.batchID;
    const ticketID = req.body.ticketID;
    const result = parkingDBConvict.addParkingTicketToConvictionBatch(batchID, ticketID, req.session);
    if (result.success) {
        result.batch = parkingDBConvict.getParkingTicketConvictionBatch(batchID);
    }
    return res.json(result);
});
router.post("/doLockConvictionBatch", (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const batchID = req.body.batchID;
    const result = parkingDBConvict.lockConvictionBatch(batchID, req.session);
    return res.json(result);
});
router.post("/doUnlockConvictionBatch", (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const batchID = req.body.batchID;
    const success = parkingDBConvict.unlockConvictionBatch(batchID, req.session);
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
    return res.json(parkingDB_getParkingTicketRemarks.getParkingTicketRemarks(req.body.ticketID, req.session));
});
router.post("/doAddRemark", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_createParkingTicketRemark.createParkingTicketRemark(req.body, req.session);
    return res.json(result);
});
router.post("/doUpdateRemark", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_updateParkingTicketRemark.updateParkingTicketRemark(req.body, req.session);
    return res.json(result);
});
router.post("/doDeleteRemark", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_deleteParkingTicketRemark.deleteParkingTicketRemark(req.body.ticketID, req.body.remarkIndex, req.session);
    return res.json(result);
});
router.post("/doGetStatuses", (req, res) => {
    return res.json(parkingDB_getParkingTicketStatuses.getParkingTicketStatuses(req.body.ticketID, req.session));
});
router.post("/doAddStatus", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_createParkingTicketStatus.createParkingTicketStatus(req.body, req.session, req.body.resolveTicket === "1");
    return res.json(result);
});
router.post("/doUpdateStatus", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_updateParkingTicketStatus.updateParkingTicketStatus(req.body, req.session);
    return res.json(result);
});
router.post("/doDeleteStatus", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_deleteParkingTicketStatus.deleteParkingTicketStatus(req.body.ticketID, req.body.statusIndex, req.session);
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
