import { Router } from "express";
const router = Router();

import * as parkingDB from "../helpers/parkingDB";


router.post("/doGetAllLocations", function(_req, res) {

  res.json(parkingDB.getParkingLocations());

});


router.post("/doGetOffencesByLocation", function(req, res) {

  res.json(parkingDB.getParkingOffencesByLocationKey(req.body.locationKey));

});


router.post("/doGetAllOffences", function(_req, res) {

  res.json(parkingDB.getParkingOffences());

});

export = router;
