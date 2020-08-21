import { Router } from "express";

import * as parkingDB_getParkingLocations from "../helpers/parkingDB/getParkingLocations";
import * as parkingDB_getParkingOffences from "../helpers/parkingDB/getParkingOffences";

const router = Router();


router.post("/doGetAllLocations", (_req, res) => {

  res.json(parkingDB_getParkingLocations.getParkingLocations());

});


router.post("/doGetOffencesByLocation", (req, res) => {

  res.json(parkingDB_getParkingOffences.getParkingOffencesByLocationKey(req.body.locationKey));

});


router.post("/doGetAllOffences", (_req, res) => {

  res.json(parkingDB_getParkingOffences.getParkingOffences());

});

export = router;
