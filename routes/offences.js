"use strict";
const express = require("express");
const router = express.Router();
const parkingDB = require("../helpers/parkingDB");
router.get("/", function (_req, res) {
    res.render("offence-search", {
        headTitle: "Parking Offences"
    });
});
router.post("/doGetAllLocations", function (_req, res) {
    res.json(parkingDB.getParkingLocations());
});
router.post("/doGetOffencesByLocation", function (req, res) {
    res.json(parkingDB.getParkingOffences(req.body.locationKey));
});
module.exports = router;
