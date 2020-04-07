"use strict";

import express = require("express");
const router = express.Router();

import * as usersDB from "../helpers/usersDB";
import * as parkingDB from "../helpers/parkingDB";


// User Management


router.get("/userManagement", function(req, res) {

  if (!req.session.user.userProperties.isAdmin) {

    res.redirect("/dashboard/?error=accessDenied");
    return;

  }

  const users = usersDB.getAllUsers();

  res.render("admin-userManagement", {
    headTitle: "User Management",
    users: users
  });

});

router.post("/doCreateUser", function(req, res) {

  if (!req.session.user.userProperties.isAdmin) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const newPassword = usersDB.createUser(req.body);

  if (!newPassword) {

    res.json({
      success: false,
      message: "New Account Not Created"
    });

  } else {

    res.json({
      success: true,
      newPassword: newPassword
    });

  }

});

router.post("/doUpdateUser", function(req, res) {

  if (!req.session.user.userProperties.isAdmin) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const changeCount = usersDB.updateUser(req.body);

  res.json({
    success: (changeCount === 1)
  });

});

router.post("/doUpdateUserProperty", function(req, res) {

  if (!req.session.user.userProperties.isAdmin) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const changeCount = usersDB.updateUserProperty(req.body);

  res.json({
    success: (changeCount === 1)
  });

});

router.post("/doResetPassword", function(req, res) {

  if (!req.session.user.userProperties.isAdmin) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const newPassword = usersDB.generateNewPassword(req.body.userName);

  res.json({
    success: true,
    newPassword: newPassword
  });

});

router.post("/doGetUserProperties", function(req, res) {

  if (!req.session.user.userProperties.isAdmin) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });
    return;

  }

  const userProperties = usersDB.getUserProperties(req.body.userName);

  res.json(userProperties);

});

router.post("/doDeleteUser", function(req, res) {

  if (!req.session.user.userProperties.isAdmin) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });
    return;

  }

  const userNameToDelete = req.body.userName;

  if (userNameToDelete === req.session.user.userName) {

    // You can't delete yourself!

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });
    return;

  }

  const success = usersDB.inactivateUser(userNameToDelete);

  res.json({
    success: success
  })

});


// Offence Maintenance


router.get("/offences", function(_req, res) {

  res.render("offence-maint", {
    headTitle: "Parking Offences"
  });

});


// Location Maintenance


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


// By-Law Maintenance


router.get("/bylaws", function(_req, res) {

  res.render("bylaw-maint", {
    headTitle: "By-Law Maintenance"
  });
});


export = router;
