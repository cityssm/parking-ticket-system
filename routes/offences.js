"use strict";
const express_1 = require("express");
const router = express_1.Router();
const parkingDBRelated = require("../helpers/parkingDB-related");
router.post("/doGetAllLocations", function (_req, res) {
    res.json(parkingDBRelated.getParkingLocations());
});
router.post("/doGetOffencesByLocation", function (req, res) {
    res.json(parkingDBRelated.getParkingOffencesByLocationKey(req.body.locationKey));
});
router.post("/doGetAllOffences", function (_req, res) {
    res.json(parkingDBRelated.getParkingOffences());
});
module.exports = router;
