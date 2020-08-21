import { Router } from "express";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

// Tickets
import * as handler_new from "../handlers/tickets-get/new";
import * as handler_doGetTickets from "../handlers/tickets-post/doGetTickets";
import * as handler_doCreateTicket from "../handlers/tickets-post/doCreateTicket";
import * as handler_doUpdateTicket from "../handlers/tickets-post/doUpdateTicket";
import * as handler_doResolveTicket from "../handlers/tickets-post/doResolveTicket";
import * as handler_doUnresolveTicket from "../handlers/tickets-post/doUnresolveTicket";
import * as handler_doDeleteTicket from "../handlers/tickets-post/doDeleteTicket";
import * as handler_doRestoreTicket from "../handlers/tickets-post/doRestoreTicket";

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

import * as parkingDB from "../helpers/parkingDB";

// Get tickets
import * as parkingDB_getParkingTicket from "../helpers/parkingDB/getParkingTicket";
import * as parkingDB_getParkingTicketID from "../helpers/parkingDB/getParkingTicketID";

// Remarks
import * as parkingDB_parkingTicketRemarks from "../helpers/parkingDB/parkingTicketRemarks";

// Statuses
import * as parkingDB_parkingTicketStatuses from "../helpers/parkingDB/parkingTicketStatuses";

import { userCanCreate, forbiddenJSON } from "../helpers/userFns";


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
