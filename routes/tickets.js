"use strict";
const express = require("express");
const router = express.Router();
const parkingDB = require("../helpers/parkingDB");
router.get("/", function (_req, res) {
    res.render("ticket-search", {
        headTitle: "Parking Tickets",
        pageContainerIsFullWidth: true
    });
});
router.post("/doGetTickets", function (req, res) {
    let queryOptions = {
        limit: req.body.limit,
        offset: req.body.offset,
        licencePlateNumber: req.body.licencePlateNumber
    };
    if (req.body.isResolved !== "") {
        queryOptions.isResolved = (req.body.isResolved === "1");
    }
    res.json(parkingDB.getParkingTickets(req.session, queryOptions));
});
module.exports = router;
