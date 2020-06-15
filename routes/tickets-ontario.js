"use strict";
const express_1 = require("express");
const router = express_1.Router();
const parkingDBOntario = require("../helpers/parkingDB-ontario");
const parkingDBConvict = require("../helpers/parkingDB-convict");
const mtoFns = require("../helpers/mtoFns");
router.get("/convict", function (req, res) {
    if (!(req.session.user.userProperties.canUpdate || req.session.user.userProperties.isOperator)) {
        res.redirect("/tickets/?error=accessDenied");
        return;
    }
    const tickets = parkingDBOntario.getParkingTicketsAvailableForMTOConvictionBatch();
    const batch = parkingDBConvict.getParkingTicketConvictionBatch(-1);
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
    const result = parkingDBConvict.addAllParkingTicketsToConvictionBatch(batchID, ticketIDs, req.session);
    if (result.successCount > 0) {
        result.batch = parkingDBConvict.getParkingTicketConvictionBatch(batchID);
        result.tickets = parkingDBOntario.getParkingTicketsAvailableForMTOConvictionBatch();
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
    const result = parkingDBConvict.clearConvictionBatch(batchID, req.session);
    if (result.success) {
        result.batch = parkingDBConvict.getParkingTicketConvictionBatch(batchID);
        result.tickets = parkingDBOntario.getParkingTicketsAvailableForMTOConvictionBatch();
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
    const result = parkingDBConvict.removeParkingTicketFromConvictionBatch(batchID, ticketID, req.session);
    if (result.success) {
        result.tickets = parkingDBOntario.getParkingTicketsAvailableForMTOConvictionBatch();
    }
    return res.json(result);
});
module.exports = router;
