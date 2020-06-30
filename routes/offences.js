"use strict";
const express_1 = require("express");
const parkingDBRelated = require("../helpers/parkingDB-related");
const router = express_1.Router();
router.post("/doGetAllLocations", (_req, res) => {
    res.json(parkingDBRelated.getParkingLocations());
});
router.post("/doGetOffencesByLocation", (req, res) => {
    res.json(parkingDBRelated.getParkingOffencesByLocationKey(req.body.locationKey));
});
router.post("/doGetAllOffences", (_req, res) => {
    res.json(parkingDBRelated.getParkingOffences());
});
module.exports = router;
