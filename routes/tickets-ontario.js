"use strict";
const express_1 = require("express");
const router = express_1.Router();
const parkingDB = require("../helpers/parkingDB");
const parkingDB_ontario_1 = require("../helpers/parkingDB-ontario");
router.get("/convict", function (req, res) {
    if (!req.session.user.userProperties.canUpdate) {
        res.redirect("/tickets/?error=accessDenied");
        return;
    }
    const tickets = parkingDB_ontario_1.getParkingTicketsAvailableForMTOConvictionBatch();
    const batch = parkingDB.getParkingTicketConvictionBatch(-1);
    res.render("mto-ticketConvict", {
        headTitle: "Convict Parking Tickets",
        tickets: tickets,
        batch: batch
    });
});
module.exports = router;
