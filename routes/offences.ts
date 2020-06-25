import { Router } from "express";
const router = Router();

import * as parkingDBRelated from "../helpers/parkingDB-related";


router.post("/doGetAllLocations", (_req, res) => {

  res.json(parkingDBRelated.getParkingLocations());

});


router.post("/doGetOffencesByLocation", (req, res) => {

  res.json(parkingDBRelated.getParkingOffencesByLocationKey(req.body.locationKey));

});


router.post("/doGetAllOffences", (_req, res) => {

  res.json(parkingDBRelated.getParkingOffences());

});

export = router;
