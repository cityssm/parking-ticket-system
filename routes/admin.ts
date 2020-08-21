import { Router } from "express";

import * as usersDB from "../helpers/usersDB";
import * as parkingDBCleanup from "../helpers/parkingDB-cleanup";

import * as parkingDB_updateParkingOffencesByBylawNumber from "../helpers/parkingDB/updateParkingOffencesByBylawNumber";

import * as parkingDB_getParkingBylaws from "../helpers/parkingDB/getParkingBylaws";
import * as parkingDB_addParkingBylaw from "../helpers/parkingDB/addParkingBylaw";
import * as parkingDB_updateParkingBylaw from "../helpers/parkingDB/updateParkingBylaw";
import * as parkingDB_deleteParkingBylaw from "../helpers/parkingDB/deleteParkingBylaw";

import * as parkingDB_getParkingLocations from "../helpers/parkingDB/getParkingLocations";
import * as parkingDB_addParkingLocation from "../helpers/parkingDB/addParkingLocation";
import * as parkingDB_updateParkingLocation from "../helpers/parkingDB/updateParkingLocation";
import * as parkingDB_deleteParkingLocation from "../helpers/parkingDB/deleteParkingLocation";

import * as parkingDB_getParkingOffences from "../helpers/parkingDB/getParkingOffences";
import * as parkingDB_addParkingOffence from "../helpers/parkingDB/addParkingOffence";
import * as parkingDB_updateParkingOffence from "../helpers/parkingDB/updateParkingOffence";
import * as parkingDB_deleteParkingOffence from "../helpers/parkingDB/deleteParkingOffence";

import { userIsAdmin, forbiddenJSON } from "../helpers/userFns";
import * as configFns from "../helpers/configFns";

const router = Router();


// User Management


router.get("/userManagement", (req, res) => {

  if (!userIsAdmin(req)) {
    return res.redirect("/dashboard/?error=accessDenied");
  }

  const users = usersDB.getAllUsers();

  return res.render("admin-userManagement", {
    headTitle: "User Management",
    users
  });
});

router.post("/doCreateUser", (req, res) => {

  if (!userIsAdmin(req)) {
    return forbiddenJSON(res);
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
      newPassword
    });

  }

});

router.post("/doUpdateUser", (req, res) => {

  if (!userIsAdmin(req)) {
    return forbiddenJSON(res);
  }

  const changeCount = usersDB.updateUser(req.body);

  res.json({
    success: (changeCount === 1)
  });

});

router.post("/doUpdateUserProperty", (req, res) => {

  if (!userIsAdmin(req)) {
    return forbiddenJSON(res);
  }

  const changeCount = usersDB.updateUserProperty(req.body);

  res.json({
    success: (changeCount === 1)
  });

});

router.post("/doResetPassword", (req, res) => {

  if (!userIsAdmin(req)) {
    return forbiddenJSON(res);
  }

  const newPassword = usersDB.generateNewPassword(req.body.userName);

  res.json({
    success: true,
    newPassword
  });

});

router.post("/doGetUserProperties", (req, res) => {

  if (!userIsAdmin(req)) {
    return forbiddenJSON(res);
  }

  const userProperties = usersDB.getUserProperties(req.body.userName);

  res.json(userProperties);

});

router.post("/doDeleteUser", (req, res) => {

  if (!userIsAdmin(req)) {
    return forbiddenJSON(res);
  }

  const userNameToDelete = req.body.userName;

  if (userNameToDelete === req.session.user.userName) {

    // You can't delete yourself!
    return forbiddenJSON(res);

  }

  const success = usersDB.inactivateUser(userNameToDelete);

  res.json({ success });

});


// Database Cleanup


router.get("/cleanup", (req, res) => {

  if (!userIsAdmin(req)) {
    return res.redirect("/dashboard/?error=accessDenied");
  }

  const counts = parkingDBCleanup.getDatabaseCleanupCounts();

  res.render("admin-cleanup", {
    headTitle: "Database Cleanup",
    counts
  });

});

router.post("/doCleanupTable", (req, res) => {

  if (!userIsAdmin(req)) {
    return forbiddenJSON(res);
  }

  const table = req.body.table;

  const recordDelete_timeMillis =
    Math.min(
      parseInt(req.body.recordDelete_timeMillis, 10),
      Date.now() - (configFns.getProperty("databaseCleanup.windowDays") * 86400 * 1000));

  let success = false;

  switch (table) {

    case "parkingTickets":

      success = parkingDBCleanup.cleanupParkingTicketsTable(recordDelete_timeMillis);
      break;

    case "parkingTicketRemarks":

      success = parkingDBCleanup.cleanupParkingTicketRemarksTable(recordDelete_timeMillis);
      break;

    case "parkingTicketStatusLog":

      success = parkingDBCleanup.cleanupParkingTicketStatusLog(recordDelete_timeMillis);
      break;

    case "licencePlateOwners":

      success = parkingDBCleanup.cleanupLicencePlateOwnersTable(recordDelete_timeMillis);
      break;

    case "parkingOffences":

      success = parkingDBCleanup.cleanupParkingOffencesTable();
      break;

    case "parkingLocations":

      success = parkingDBCleanup.cleanupParkingLocationsTable();
      break;

    case "parkingBylaws":

      success = parkingDBCleanup.cleanupParkingBylawsTable();
      break;
  }

  res.json({ success });

});


// Offence Maintenance


router.get("/offences", (_req, res) => {

  const locations = parkingDB_getParkingLocations.getParkingLocations();
  const bylaws = parkingDB_getParkingBylaws.getParkingBylaws();
  const offences = parkingDB_getParkingOffences.getParkingOffences();

  res.render("offence-maint", {
    headTitle: "Parking Offences",
    locations,
    bylaws,
    offences
  });

});

router.post("/doAddOffence", (req, res) => {

  const results = parkingDB_addParkingOffence.addParkingOffence(req.body);

  if (results.success && req.body.returnOffences) {

    results.offences = parkingDB_getParkingOffences.getParkingOffences();

  }

  res.json(results);

});

router.post("/doUpdateOffence", (req, res) => {

  const results = parkingDB_updateParkingOffence.updateParkingOffence(req.body);

  if (results.success) {

    results.offences = parkingDB_getParkingOffences.getParkingOffences();

  }

  res.json(results);

});

router.post("/doDeleteOffence", (req, res) => {

  const results = parkingDB_deleteParkingOffence.deleteParkingOffence(req.body.bylawNumber, req.body.locationKey);

  if (results.success) {

    results.offences = parkingDB_getParkingOffences.getParkingOffences();

  }

  res.json(results);

});


// Location Maintenance


router.get("/locations", (_req, res) => {

  const locations = parkingDB_getParkingLocations.getParkingLocations();

  res.render("location-maint", {
    headTitle: "Parking Location Maintenance",
    locations
  });

});

router.post("/doAddLocation", (req, res) => {

  const results = parkingDB_addParkingLocation.addParkingLocation(req.body);

  if (results.success) {

    results.locations = parkingDB_getParkingLocations.getParkingLocations();

  }

  res.json(results);

});

router.post("/doUpdateLocation", (req, res) => {

  const results = parkingDB_updateParkingLocation.updateParkingLocation(req.body);

  if (results.success) {

    results.locations = parkingDB_getParkingLocations.getParkingLocations();

  }

  res.json(results);

});

router.post("/doDeleteLocation", (req, res) => {

  const results = parkingDB_deleteParkingLocation.deleteParkingLocation(req.body.locationKey);

  if (results.success) {

    results.locations = parkingDB_getParkingLocations.getParkingLocations();

  }

  res.json(results);

});


// By-Law Maintenance


router.get("/bylaws", (_req, res) => {

  const bylaws = parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats();

  res.render("bylaw-maint", {
    headTitle: "By-Law Maintenance",
    bylaws
  });

});

router.post("/doAddBylaw", (req, res) => {

  const results = parkingDB_addParkingBylaw.addParkingBylaw(req.body);

  if (results.success) {

    results.bylaws = parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats();

  }

  res.json(results);

});

router.post("/doUpdateBylaw", (req, res) => {

  const results = parkingDB_updateParkingBylaw.updateParkingBylaw(req.body);

  if (results.success) {

    results.bylaws = parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats();

  }

  res.json(results);

});

router.post("/doUpdateOffencesByBylaw", (req, res) => {

  const results = parkingDB_updateParkingOffencesByBylawNumber.updateParkingOffencesByBylawNumber(req.body);

  if (results.success) {

    results.bylaws = parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats();

  }

  res.json(results);

});

router.post("/doDeleteBylaw", (req, res) => {

  const results = parkingDB_deleteParkingBylaw.deleteParkingBylaw(req.body.bylawNumber);

  if (results.success) {

    results.bylaws = parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats();

  }

  res.json(results);

});

export = router;
