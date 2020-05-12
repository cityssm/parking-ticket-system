"use strict";
const express_1 = require("express");
const router = express_1.Router();
const parkingDB = require("../helpers/parkingDB");
router.post("/doGetAllLocations", function (_req, res) {
    res.json(parkingDB.getParkingLocations());
});
router.post("/doGetOffencesByLocation", function (req, res) {
    res.json(parkingDB.getParkingOffencesByLocationKey(req.body.locationKey));
});
router.post("/doGetAllOffences", function (_req, res) {
    res.json(parkingDB.getParkingOffences());
});
module.exports = router;
