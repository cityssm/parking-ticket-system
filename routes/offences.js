"use strict";
const express = require("express");
const router = express.Router();
router.get("/", function (_req, res) {
    res.render("offence-search", {
        headTitle: "Parking Offences"
    });
});
module.exports = router;
