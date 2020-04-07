import express = require("express");
const router = express.Router();

import * as parkingDB from "../helpers/parkingDB";


router.post("/doGetAllLocations", function(_req, res) {

  res.json(parkingDB.getParkingLocations());

});


router.post("/doGetOffencesByLocation", function(req, res) {

  res.json(parkingDB.getParkingOffences(req.body.locationKey));

});


export = router;
