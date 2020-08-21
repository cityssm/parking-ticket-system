import { Router } from "express";

import * as configFns from "../helpers/configFns";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import * as handler_doGetTickets from "../handlers/tickets-post/doGetTickets";

// Reconciliation
import * as handler_reconcile from "../handlers/tickets-get/reconcile";
import * as handler_doAcknowledgeLookupError from "../handlers/tickets-post/doAcknowledgeLookupError";
import * as handler_doQuickReconcileMatches from "../handlers/tickets-post/doQuickReconcileMatches";
import * as handler_doReconcileAsMatch from "../handlers/tickets-post/doReconcileAsMatch";
import * as handler_doReconcileAsError from "../handlers/tickets-post/doReconcileAsError";

import * as parkingDB from "../helpers/parkingDB";

// Get tickets
import * as parkingDB_getParkingTicket from "../helpers/parkingDB/getParkingTicket";
import * as parkingDB_getParkingTicketID from "../helpers/parkingDB/getParkingTicketID";

// Update tickets
import * as parkingDB_createParkingTicket from "../helpers/parkingDB/createParkingTicket";
import * as parkingDB_updateParkingTicket from "../helpers/parkingDB/updateParkingTicket";
import * as parkingDB_resolveParkingTicket from "../helpers/parkingDB/resolveParkingTicket";
import * as parkingDB_unresolveParkingTicket from "../helpers/parkingDB/unresolveParkingTicket";
import * as parkingDB_deleteParkingTicket from "../helpers/parkingDB/deleteParkingTicket";
import * as parkingDB_restoreParkingTicket from "../helpers/parkingDB/restoreParkingTicket";

// Remarks
import * as parkingDB_parkingTicketRemarks from "../helpers/parkingDB/parkingTicketRemarks";

// Statuses
import * as parkingDB_parkingTicketStatuses from "../helpers/parkingDB/parkingTicketStatuses";

// Convictions
import * as parkingDB_getLastTenConvictionBatches from "../helpers/parkingDB/getLastTenConvictionBatches";
import * as parkingDB_getConvictionBatch from "../helpers/parkingDB/getConvictionBatch";
import * as parkingDB_createConvictionBatch from "../helpers/parkingDB/createConvictionBatch";
import * as parkingDB_addParkingTicketToConvictionBatch from "../helpers/parkingDB/addParkingTicketToConvictionBatch";
import * as parkingDB_lockConvictionBatch from "../helpers/parkingDB/lockConvictionBatch";
import * as parkingDB_unlockConvictionBatch from "../helpers/parkingDB/unlockConvictionBatch";

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

router.post("/doGetTickets", handler_doGetTickets.handler);

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

router.post("/doGetRecentConvictionBatches", (req, res) => {

  if (!(userCanUpdate(req) || userIsOperator(req))) {
    return forbiddenJSON(res);
  }

  const batches = parkingDB_getLastTenConvictionBatches.getLastTenConvictionBatches();

  return res.json(batches);
});

router.post("/doGetConvictionBatch", (req, res) => {

  if (!(userCanUpdate(req) || userIsOperator(req))) {
    return forbiddenJSON(res);
  }

  const batch = parkingDB_getConvictionBatch.getConvictionBatch(
    req.body.batchID
  );

  return res.json(batch);
});

router.post("/doCreateConvictionBatch", (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const batchResult = parkingDB_createConvictionBatch.createConvictionBatch(
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
  } = parkingDB_addParkingTicketToConvictionBatch.addParkingTicketToConvictionBatch(
    batchID,
    ticketID,
    req.session
  );

  if (result.success) {
    result.batch = parkingDB_getConvictionBatch.getConvictionBatch(batchID);
  }

  return res.json(result);
});

router.post("/doLockConvictionBatch", (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const batchID = req.body.batchID;

  const result = parkingDB_lockConvictionBatch.lockConvictionBatch(batchID, req.session);

  return res.json(result);
});

router.post("/doUnlockConvictionBatch", (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const batchID = req.body.batchID;

  const success = parkingDB_unlockConvictionBatch.unlockConvictionBatch(batchID, req.session);

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

  const result = parkingDB_createParkingTicket.createParkingTicket(req.body, req.session);

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

  const result = parkingDB_updateParkingTicket.updateParkingTicket(req.body, req.session);

  return res.json(result);
});

router.post("/doDeleteTicket", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_deleteParkingTicket.deleteParkingTicket(req.body.ticketID, req.session);

  return res.json(result);
});

router.post("/doResolveTicket", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_resolveParkingTicket.resolveParkingTicket(req.body.ticketID, req.session);

  return res.json(result);
});

router.post("/doUnresolveTicket", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_unresolveParkingTicket.unresolveParkingTicket(
    req.body.ticketID,
    req.session
  );

  return res.json(result);
});

router.post("/doRestoreTicket", (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_restoreParkingTicket.restoreParkingTicket(req.body.ticketID, req.session);

  return res.json(result);
});

/*
 * Ticket Remarks
 */

router.post("/doGetRemarks", (req, res) => {
  return res.json(parkingDB_parkingTicketRemarks.getParkingTicketRemarks(req.body.ticketID, req.session));
});

router.post("/doAddRemark", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_parkingTicketRemarks.createParkingTicketRemark(req.body, req.session);

  return res.json(result);
});

router.post("/doUpdateRemark", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_parkingTicketRemarks.updateParkingTicketRemark(req.body, req.session);

  return res.json(result);
});

router.post("/doDeleteRemark", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_parkingTicketRemarks.deleteParkingTicketRemark(
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
  return res.json(parkingDB_parkingTicketStatuses.getParkingTicketStatuses(req.body.ticketID, req.session));
});

router.post("/doAddStatus", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_parkingTicketStatuses.createParkingTicketStatus(
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

  const result = parkingDB_parkingTicketStatuses.updateParkingTicketStatus(req.body, req.session);

  return res.json(result);
});

router.post("/doDeleteStatus", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const result = parkingDB_parkingTicketStatuses.deleteParkingTicketStatus(
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

  const ticket = parkingDB_getParkingTicket.getParkingTicket(ticketID, req.session);

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

  const ticketID = parkingDB_getParkingTicketID.getParkingTicketID(ticketNumber);

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

  const ticket = parkingDB_getParkingTicket.getParkingTicket(ticketID, req.session);

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
