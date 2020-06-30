import { Router } from "express";

import * as parkingDBRelated from "../helpers/parkingDB-related";

const router = Router();


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
