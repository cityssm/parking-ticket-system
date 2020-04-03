import express = require("express");
const router = express.Router();

import * as parkingDB from "../helpers/parkingDB";


router.get("/", function(_req, res) {

  res.render("offence-maint", {
    headTitle: "Parking Offences"
  });

});


router.get("/locations", function(_req, res) {

  res.render("location-maint", {
    headTitle: "Parking Location Maintenance"
  });

});


router.get("/bylaws", function(_req, res) {

  res.render("bylaw-maint", {
    headTitle: "By-Law Maintenance"
  });
});


router.post("/doGetAllLocations", function(_req, res) {

  res.json(parkingDB.getParkingLocations());

});


router.post("/doGetOffencesByLocation", function(req, res) {

  res.json(parkingDB.getParkingOffences(req.body.locationKey));

});


export = router;
