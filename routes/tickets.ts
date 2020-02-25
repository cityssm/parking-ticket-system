"use strict";

import express = require("express");
const router = express.Router();

import * as parkingDB from "../helpers/parkingDB";


router.get("/", function(_req, res) {

  res.render("ticket-search", {
    headTitle: "Parking Tickets",
    pageContainerIsFullWidth: true
  });

});


router.post("/doGetTickets", function(req, res) {

  let queryOptions: parkingDB.getParkingTickets_queryOptions = {
    limit: req.body.limit,
    offset: req.body.offset
  };

  if (req.body.isResolved !== "") {
    queryOptions.isResolved = (req.body.isResolved === "1");
  }

  res.json(parkingDB.getParkingTickets(req.session, queryOptions));

});


export = router;
