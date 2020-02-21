"use strict";
const express = require("express");
const router = express.Router();
router.get("/", function (_req, res) {
    res.render("ticket-search", {
        headTitle: "Parking Tickets"
    });
});
module.exports = router;
