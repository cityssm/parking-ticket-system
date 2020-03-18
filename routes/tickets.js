"use strict";
const express = require("express");
const router = express.Router();
const configFns = require("../helpers/configFns");
const dateTimeFns = require("../helpers/dateTimeFns");
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
router.get([
    "/new",
    "/new/:ticketNumber"
], function (req, res) {
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
router.post("/doCreateTicket", function (req, res) {
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
router.post("/doUpdateTicket", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const result = parkingDB.updateParkingTicket(req.body, req.session);
    res.json(result);
});
router.post("/doDeleteTicket", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const result = parkingDB.deleteParkingTicket(req.body.ticketID, req.session);
    res.json(result);
});
router.post("/doResolveTicket", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const result = parkingDB.resolveParkingTicket(req.body.ticketID, req.session);
    res.json(result);
});
router.post("/doUnresolveTicket", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const result = parkingDB.unresolveParkingTicket(req.body.ticketID, req.session);
    res.json(result);
});
router.post("/doGetRemarks", function (req, res) {
    res.json(parkingDB.getParkingTicketRemarks(req.body.ticketID, req.session));
});
router.post("/doAddRemark", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const result = parkingDB.createParkingTicketRemark(req.body, req.session);
    res.json(result);
});
router.post("/doUpdateRemark", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const result = parkingDB.updateParkingTicketRemark(req.body, req.session);
    res.json(result);
});
router.post("/doDeleteRemark", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const result = parkingDB.deleteParkingTicketRemark(req.body.ticketID, req.body.remarkIndex, req.session);
    res.json(result);
});
router.post("/doGetStatuses", function (req, res) {
    res.json(parkingDB.getParkingTicketStatuses(req.body.ticketID, req.session));
});
router.post("/doAddStatus", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    console.log(req.body.resolveTicket);
    console.log(req.body.resolveTicket === "1");
    const result = parkingDB.createParkingTicketStatus(req.body, req.session, req.body.resolveTicket === "1");
    res.json(result);
});
router.post("/doDeleteStatus", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const result = parkingDB.deleteParkingTicketStatus(req.body.ticketID, req.body.statusIndex, req.session);
    res.json(result);
});
router.get("/:ticketID", function (req, res) {
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
router.get("/:ticketID/edit", function (req, res) {
    const ticketID = parseInt(req.params.ticketID);
    if (!req.session.user.userProperties.canCreate) {
        res.redirect("/tickets/" + ticketID);
        return;
    }
    const ticket = parkingDB.getParkingTicket(ticketID, req.session);
    if (!ticket) {
        res.redirect("/tickets/?error=ticketNotFound");
        return;
    }
    else if (!ticket.canUpdate || ticket.resolvedDate) {
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
module.exports = router;
