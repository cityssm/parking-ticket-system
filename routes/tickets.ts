"use strict";

import express = require("express");
const router = express.Router();

import * as configFns from "../helpers/configFns";
import * as dateTimeFns from "../helpers/dateTimeFns";
import * as parkingDB from "../helpers/parkingDB";


/*
 * Ticket Search
 */


router.get("/", function(_req, res) {

  res.render("ticket-search", {
    headTitle: "Parking Tickets",
    pageContainerIsFullWidth: true
  });

});


router.post("/doGetTickets", function(req, res) {

  let queryOptions: parkingDB.getParkingTickets_queryOptions = {
    limit: req.body.limit,
    offset: req.body.offset,
    ticketNumber: req.body.ticketNumber,
    licencePlateNumber: req.body.licencePlateNumber,
    location: req.body.location
  };

  if (req.body.isResolved !== "") {
    queryOptions.isResolved = (req.body.isResolved === "1");
  }

  res.json(parkingDB.getParkingTickets(req.session, queryOptions));

});


/*
 * New Ticket
 */


router.get([
  "/new",
  "/new/:ticketNumber"
], function(req, res) {

  if (!req.session.user.userProperties.canCreate) {
    res.redirect("/tickets/?error=accessDenied");
    return;
  }

  const ticketNumber = req.params.ticketNumber;

  const vehicleMakeModelDatalist = parkingDB.getRecentParkingTicketVehicleMakeModelValues();

  res.render("ticket-edit", {
    headTitle: "New Ticket",
    pageContainerIsFullWidth: true,
    isCreate: true,
    ticket: {
      ticketNumber: ticketNumber,
      licencePlateCountry: configFns.getProperty("defaults.country"),
      licencePlateProvince: configFns.getProperty("defaults.province")
    },
    issueDateMaxString: dateTimeFns.dateToString(new Date()),
    vehicleMakeModelDatalist: vehicleMakeModelDatalist
  });

});


router.post("/doCreateTicket", function(req, res) {

  if (!req.session.user.userProperties.canCreate) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const result = parkingDB.createParkingTicket(req.body, req.session);

  if (result.success) {

    const ticketNumber = req.body.ticketNumber;
    result.nextTicketNumber = configFns.getProperty("parkingTickets.ticketNumber.nextTicketNumberFn")(ticketNumber);

  }

  res.json(result);

});


/*
 * Ticket View
 */


router.get("/:ticketID", function(req, res) {

  const ticketID = parseInt(req.params.ticketID);

  const ticket = parkingDB.getParkingTicket(ticketID, req.session);

  if (!ticket) {
    res.redirect("/tickets/?error=ticketNotFound");
    return;
  }

  res.render("ticket-view", {
    headTitle: "Ticket " + ticket.ticketNumber,
    ticket: ticket
  });

});


/*
 * Ticket Edit
 */


router.get("/:ticketID/edit", function(req, res) {

  const ticketID = parseInt(req.params.ticketID);

  if (!req.session.user.userProperties.canCreate) {
    res.redirect("/tickets/" + ticketID);
    return;
  }

  const ticket = parkingDB.getParkingTicket(ticketID, req.session);

  if (!ticket) {

    res.redirect("/tickets/?error=ticketNotFound");
    return;

  } else if (!ticket.canUpdate) {

    res.redirect("/tickets/" + ticketID + "/?error=accessDenied");
    return;

  }

  const vehicleMakeModelDatalist = parkingDB.getRecentParkingTicketVehicleMakeModelValues();

  res.render("ticket-edit", {
    headTitle: "Ticket " + ticket.ticketNumber,
    pageContainerIsFullWidth: true,
    isCreate: false,
    ticket: ticket,
    issueDateMaxString: dateTimeFns.dateToString(new Date()),
    vehicleMakeModelDatalist: vehicleMakeModelDatalist
  });

});


export = router;
