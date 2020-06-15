"use strict";
const express_1 = require("express");
const router = express_1.Router();
const parkingDB = require("../helpers/parkingDB");
const ontarioParkingDB = require("../helpers/parkingDB-ontario");
const mtoFns = require("../helpers/mtoFns");
router.get("/convict", function (req, res) {
    if (!(req.session.user.userProperties.canUpdate || req.session.user.userProperties.isOperator)) {
        res.redirect("/tickets/?error=accessDenied");
        return;
    }
    const tickets = ontarioParkingDB.getParkingTicketsAvailableForMTOConvictionBatch();
    const batch = parkingDB.getParkingTicketConvictionBatch(-1);
    res.render("mto-ticketConvict", {
        headTitle: "Convict Parking Tickets",
        tickets: tickets,
        batch: batch
    });
});
router.get("/convict/:batchID", function (req, res) {
    if (!(req.session.user.userProperties.canUpdate || req.session.user.userProperties.isOperator)) {
        res.redirect("/tickets/?error=accessDenied");
        return;
    }
    const batchID = parseInt(req.params.batchID, 10);
    const output = mtoFns.exportConvictionBatch(batchID, req.session);
    res.setHeader("Content-Disposition", "attachment; filename=convictBatch-" + batchID + ".txt");
    res.setHeader("Content-Type", "text/plain");
    res.send(output);
});
router.post("/doAddAllTicketsToConvictionBatch", function (req, res) {
    if (!req.session.user.userProperties.canUpdate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const batchID = req.body.batchID;
    const ticketIDs = req.body.ticketIDs;
    const result = parkingDB.addAllParkingTicketsToConvictionBatch(batchID, ticketIDs, req.session);
    if (result.successCount > 0) {
        result.batch = parkingDB.getParkingTicketConvictionBatch(batchID);
        result.tickets = ontarioParkingDB.getParkingTicketsAvailableForMTOConvictionBatch();
    }
    return res.json(result);
});
router.post("/doClearConvictionBatch", function (req, res) {
    if (!req.session.user.userProperties.canUpdate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const batchID = req.body.batchID;
    const result = parkingDB.clearConvictionBatch(batchID, req.session);
    if (result.success) {
        result.batch = parkingDB.getParkingTicketConvictionBatch(batchID);
        result.tickets = ontarioParkingDB.getParkingTicketsAvailableForMTOConvictionBatch();
    }
    return res.json(result);
});
router.post("/doRemoveTicketFromConvictionBatch", function (req, res) {
    if (!req.session.user.userProperties.canUpdate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const batchID = req.body.batchID;
    const ticketID = req.body.ticketID;
    const result = parkingDB.removeParkingTicketFromConvictionBatch(batchID, ticketID, req.session);
    if (result.success) {
        result.tickets = ontarioParkingDB.getParkingTicketsAvailableForMTOConvictionBatch();
    }
    return res.json(result);
});
module.exports = router;