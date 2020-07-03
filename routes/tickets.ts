import { Router } from "express";

import * as configFns from "../helpers/configFns";
import * as ownerFns from "../helpers/ownerFns";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import * as parkingDB from "../helpers/parkingDB";
import * as parkingDBLookup from "../helpers/parkingDB-lookup";
import * as parkingDBConvict from "../helpers/parkingDB-convict";

import type * as pts from "../helpers/ptsTypes";

import { userCanCreate, userCanUpdate, userIsOperator, forbiddenJSON } from "../helpers/userFns";

const router = Router();


/*
 * Ticket Search
 */

router.get("/", (_req, res) => {
  res.render("ticket-search", {
    headTitle: "Parking Tickets"
  });
});

router.post("/doGetTickets", (req, res) => {

  const queryOptions: parkingDB.GetParkingTicketsQueryOptions = {
    limit: req.body.limit,
    offset: req.body.offset,
    ticketNumber: req.body.ticketNumber,
    licencePlateNumber: req.body.licencePlateNumber,
    location: req.body.location
  };

  if (req.body.isResolved !== "") {
    queryOptions.isResolved = req.body.isResolved === "1";
  }

  res.json(parkingDB.getParkingTickets(req.session, queryOptions));
});

/*
 * Ownership Reconciliation
 */

router.get("/reconcile", (req, res) => {

  if (!userCanUpdate(req)) {
    return res.redirect("/tickets/?error=accessDenied");
  }

  const reconciliationRecords = parkingDBLookup.getOwnershipReconciliationRecords();

  const lookupErrors = parkingDBLookup.getUnacknowledgedLicencePlateLookupErrorLog(
    -1,
    -1
  );

  return res.render("ticket-reconcile", {
    headTitle: "Ownership Reconciliation",
    records: reconciliationRecords,
    errorLog: lookupErrors
  });
});

router.post("/doAcknowledgeLookupError", (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  // Get log entry

  const logEntries = parkingDBLookup.getUnacknowledgedLicencePlateLookupErrorLog(
    req.body.batchID,
    req.body.logIndex
  );

  if (logEntries.length === 0) {

    return res.json({
      success: false,
      message: "Log entry not found.  It may have already been acknowledged."
    });
  }

  // Set status on parking ticket

  const statusResponse = parkingDB.createParkingTicketStatus(
    {
      recordType: "status",
      ticketID: logEntries[0].ticketID,
      statusKey: "ownerLookupError",
      statusField: "",
      statusNote:
        logEntries[0].errorMessage + " (" + logEntries[0].errorCode + ")"
    },
    req.session,
    false
  );

  if (!statusResponse.success) {

    return res.json({
      success: false,
      message:
        "Unable to update the status on the parking ticket.  It may have been resolved."
    });
  }

  // Mark log entry as acknowledged

  const success = parkingDBLookup.markLicencePlateLookupErrorLogEntryAcknowledged(
    req.body.batchID,
    req.body.logIndex,
    req.session
  );

  return res.json({
    success
  });
});

router.post("/doReconcileAsMatch", (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const ownerRecord = parkingDB.getLicencePlateOwner(
    req.body.licencePlateCountry,
    req.body.licencePlateProvince,
    req.body.licencePlateNumber,
    req.body.recordDate
  );

  if (!ownerRecord) {

    return res.json({
      success: false,
      message: "Ownership record not found."
    });
  }

  const ownerAddress = ownerFns.getFormattedOwnerAddress(ownerRecord);

  const statusResponse = parkingDB.createParkingTicketStatus(
    {
      recordType: "status",
      ticketID: parseInt(req.body.ticketID, 10),
      statusKey: "ownerLookupMatch",
      statusField: ownerRecord.recordDate.toString(),
      statusNote: ownerAddress
    },
    req.session,
    false
  );

  return res.json(statusResponse);
});

router.post("/doReconcileAsError", (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const ownerRecord = parkingDB.getLicencePlateOwner(
    req.body.licencePlateCountry,
    req.body.licencePlateProvince,
    req.body.licencePlateNumber,
    req.body.recordDate
  );

  if (!ownerRecord) {

    return res.json({
      success: false,
      message: "Ownership record not found."
    });
  }

  const statusResponse = parkingDB.createParkingTicketStatus(
    {
      recordType: "status",
      ticketID: parseInt(req.body.ticketID, 10),
      statusKey: "ownerLookupError",
      statusField: ownerRecord.vehicleNCIC,
      statusNote: ""
    },
    req.session,
    false
  );

  return res.json(statusResponse);
});

router.post("/doQuickReconcileMatches", (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const records = parkingDBLookup.getOwnershipReconciliationRecords();

  const statusRecords: Array<{ ticketID: number; statusIndex: number }> = [];

  for (const record of records) {
    if (!record.isVehicleMakeMatch || !record.isLicencePlateExpiryDateMatch) {
      continue;
    }

    const ownerAddress = ownerFns.getFormattedOwnerAddress(record);

    const statusResponse = parkingDB.createParkingTicketStatus(
      {
        recordType: "status",
        ticketID: record.ticket_ticketID,
        statusKey: "ownerLookupMatch",
        statusField: record.owner_recordDateString,
        statusNote: ownerAddress
      },
      req.session,
      false
    );

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

// TICKET CONVICTIONS

router.post("/doGetRecentConvictionBatches", (req, res) => {

  if (!(userCanUpdate(req) || userIsOperator(req))) {
    return forbiddenJSON(res);
  }

  const batches = parkingDBConvict.getLastTenParkingTicketConvictionBatches();

  return res.json(batches);
});

router.post("/doGetConvictionBatch", (req, res) => {

  if (!(userCanUpdate(req) || userIsOperator(req))) {
    return forbiddenJSON(res);
  }

  const batch = parkingDBConvict.getParkingTicketConvictionBatch(
    req.body.batchID
  );

  return res.json(batch);
});

router.post("/doCreateConvictionBatch", (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const batchResult = parkingDBConvict.createParkingTicketConvictionBatch(
    req.session
  );

  return res.json(batchResult);
});

router.post("/doAddTicketToConvictionBatch", (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const batchID = req.body.batchID;
  const ticketID = req.body.ticketID;

  const result: {
    success: boolean;
    message?: string;
    batch?: pts.ParkingTicketConvictionBatch;
  } = parkingDBConvict.addParkingTicketToConvictionBatch(
    batchID,
    ticketID,
    req.session
  );

  if (result.success) {
    result.batch = parkingDBConvict.getParkingTicketConvictionBatch(batchID);
  }

  return res.json(result);
});

router.post("/doLockConvictionBatch", (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const batchID = req.body.batchID;

  const result = parkingDBConvict.lockConvictionBatch(batchID, req.session);

  return res.json(result);
});

router.post("/doUnlockConvictionBatch", (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const batchID = req.body.batchID;

  const success = parkingDBConvict.unlockConvictionBatch(batchID, req.session);

  return res.json({ success });
});

/*
 * New Ticket
 */

router.get(["/new", "/new/:ticketNumber"], (req, res) => {

  if (!userCanCreate(req)) {
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

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB.createParkingTicket(req.body, req.session);

  if (result.success) {
    const ticketNumber = req.body.ticketNumber;
    result.nextTicketNumber = configFns.getProperty(
      "parkingTickets.ticketNumber.nextTicketNumberFn"
    )(ticketNumber);
  }

  return res.json(result);
});

router.post("/doUpdateTicket", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB.updateParkingTicket(req.body, req.session);

  return res.json(result);
});

router.post("/doDeleteTicket", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB.deleteParkingTicket(req.body.ticketID, req.session);

  return res.json(result);
});

router.post("/doResolveTicket", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB.resolveParkingTicket(req.body.ticketID, req.session);

  return res.json(result);
});

router.post("/doUnresolveTicket", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB.unresolveParkingTicket(
    req.body.ticketID,
    req.session
  );

  return res.json(result);
});

router.post("/doRestoreTicket", (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB.restoreParkingTicket(req.body.ticketID, req.session);

  return res.json(result);
});

/*
 * Ticket Remarks
 */

router.post("/doGetRemarks", (req, res) => {
  return res.json(parkingDB.getParkingTicketRemarks(req.body.ticketID, req.session));
});

router.post("/doAddRemark", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB.createParkingTicketRemark(req.body, req.session);

  return res.json(result);
});

router.post("/doUpdateRemark", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB.updateParkingTicketRemark(req.body, req.session);

  return res.json(result);
});

router.post("/doDeleteRemark", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB.deleteParkingTicketRemark(
    req.body.ticketID,
    req.body.remarkIndex,
    req.session
  );

  return res.json(result);
});

/*
 * Ticket Statuses
 */

router.post("/doGetStatuses", (req, res) => {
  return res.json(parkingDB.getParkingTicketStatuses(req.body.ticketID, req.session));
});

router.post("/doAddStatus", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB.createParkingTicketStatus(
    req.body,
    req.session,
    req.body.resolveTicket === "1"
  );

  return res.json(result);
});

router.post("/doUpdateStatus", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB.updateParkingTicketStatus(req.body, req.session);

  return res.json(result);
});

router.post("/doDeleteStatus", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB.deleteParkingTicketStatus(
    req.body.ticketID,
    req.body.statusIndex,
    req.session
  );

  return res.json(result);
});

/*
 * Ticket View
 */

router.get("/:ticketID", (req, res) => {

  const ticketID = parseInt(req.params.ticketID, 10);

  const ticket = parkingDB.getParkingTicket(ticketID, req.session);

  if (!ticket) {
    return res.redirect("/tickets/?error=ticketNotFound");

  } else if (ticket.recordDelete_timeMillis && !req.session.user.userProperties.isAdmin) {
    return res.redirect("/tickets/?error=accessDenied");
  }

  return res.render("ticket-view", {
    headTitle: "Ticket " + ticket.ticketNumber,
    ticket
  });
});

router.get("/byTicketNumber/:ticketNumber", (req, res) => {

  const ticketNumber = req.params.ticketNumber;

  const ticketID = parkingDB.getParkingTicketID(ticketNumber);

  if (ticketID) {
    res.redirect("/tickets/" + ticketID.toString());
  } else {
    res.redirect("/tickets/?error=ticketNotFound");
  }
});

/*
 * Ticket Edit
 */

router.get("/:ticketID/edit", (req, res) => {
  const ticketID = parseInt(req.params.ticketID, 10);

  if (!userCanCreate(req)) {
    return res.redirect("/tickets/" + ticketID.toString());
  }

  const ticket = parkingDB.getParkingTicket(ticketID, req.session);

  if (!ticket) {
    return res.redirect("/tickets/?error=ticketNotFound");

  } else if (!ticket.canUpdate || ticket.resolvedDate || ticket.recordDelete_timeMillis) {
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


export = router;
