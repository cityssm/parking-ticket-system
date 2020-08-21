"use strict";
const express_1 = require("express");
const parkingDB_getParkingLocations = require("../helpers/parkingDB/getParkingLocations");
const parkingDB_getParkingOffences = require("../helpers/parkingDB/getParkingOffences");
const router = express_1.Router();
router.post("/doGetAllLocations", (_req, res) => {
    res.json(parkingDB_getParkingLocations.getParkingLocations());
});
router.post("/doGetOffencesByLocation", (req, res) => {
    res.json(parkingDB_getParkingOffences.getParkingOffencesByLocationKey(req.body.locationKey));
});
router.post("/doGetAllOffences", (_req, res) => {
    res.json(parkingDB_getParkingOffences.getParkingOffences());
});
module.exports = router;
