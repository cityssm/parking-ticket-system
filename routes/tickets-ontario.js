"use strict";
const express_1 = require("express");
const parkingDBOntario = require("../helpers/parkingDB-ontario");
const parkingDBConvict = require("../helpers/parkingDB-convict");
const userFns_1 = require("../helpers/userFns");
const mtoFns = require("../helpers/mtoFns");
const router = express_1.Router();
router.get("/convict", (req, res) => {
    if (!(userFns_1.userCanUpdate(req) || userFns_1.userIsOperator(req))) {
        res.redirect("/tickets/?error=accessDenied");
        return;
    }
    const tickets = parkingDBOntario.getParkingTicketsAvailableForMTOConvictionBatch();
    const batch = parkingDBConvict.getParkingTicketConvictionBatch(-1);
    res.render("mto-ticketConvict", {
        headTitle: "Convict Parking Tickets",
        tickets,
        batch
    });
});
router.get("/convict/:batchID", (req, res) => {
    if (!(userFns_1.userCanUpdate(req) || userFns_1.userIsOperator(req))) {
        return res.redirect("/tickets/?error=accessDenied");
    }
    const batchID = parseInt(req.params.batchID, 10);
    const output = mtoFns.exportConvictionBatch(batchID, req.session);
    res.setHeader("Content-Disposition", "attachment; filename=convictBatch-" + batchID.toString() + ".txt");
    res.setHeader("Content-Type", "text/plain");
    res.send(output);
});
router.post("/doAddAllTicketsToConvictionBatch", (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
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
router.post("/doClearConvictionBatch", (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const batchID = req.body.batchID;
    const result = parkingDBConvict.clearConvictionBatch(batchID, req.session);
    if (result.success) {
        result.batch = parkingDBConvict.getParkingTicketConvictionBatch(batchID);
        result.tickets = parkingDBOntario.getParkingTicketsAvailableForMTOConvictionBatch();
    }
    return res.json(result);
});
router.post("/doRemoveTicketFromConvictionBatch", (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
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
