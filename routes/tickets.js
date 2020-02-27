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
        ticketNumber: req.body.ticketNumber,
        licencePlateNumber: req.body.licencePlateNumber,
        location: req.body.location
    };
    if (req.body.isResolved !== "") {
        queryOptions.isResolved = (req.body.isResolved === "1");
    }
    res.json(parkingDB.getParkingTickets(req.session, queryOptions));
});
router.get("/:ticketID", function (req, res) {
    const ticketID = parseInt(req.params.ticketID);
    const ticket = parkingDB.getParkingTicket(ticketID, req.session);
    res.render("ticket-view", {
        headTitle: "Ticket " + ticket.ticketNumber,
        ticket: ticket
    });
});
module.exports = router;
