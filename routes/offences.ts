import express = require("express");
const router = express.Router();

import * as parkingDB from "../helpers/parkingDB";


router.get("/", function(_req, res) {

  res.render("offence-maint", {
    headTitle: "Parking Offences"
  });

});


router.get("/locations", function(_req, res) {

  const locations = parkingDB.getParkingLocations();

  res.render("location-maint", {
    headTitle: "Parking Location Maintenance",
    locations: locations
  });

});

router.post("/doAddLocation", function(req, res) {

  const results = parkingDB.addParkingLocation(req.body);

  if (results.success) {

    results.locations = parkingDB.getParkingLocations();

  }

  res.json(results);

});

router.post("/doUpdateLocation", function(req, res) {

  const results = parkingDB.updateParkingLocation(req.body);

  if (results.success) {

    results.locations = parkingDB.getParkingLocations();

  }

  res.json(results);

});

router.post("/doDeleteLocation", function(req, res) {

  const results = parkingDB.deleteParkingLocation(req.body.locationKey);

  if (results.success) {

    results.locations = parkingDB.getParkingLocations();

  }

  res.json(results);

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
