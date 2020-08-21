"use strict";
const express_1 = require("express");
const usersDB = require("../helpers/usersDB");
const parkingDBCleanup = require("../helpers/parkingDB-cleanup");
const parkingDB_updateParkingOffencesByBylawNumber = require("../helpers/parkingDB/updateParkingOffencesByBylawNumber");
const parkingDB_getParkingBylaws = require("../helpers/parkingDB/getParkingBylaws");
const parkingDB_addParkingBylaw = require("../helpers/parkingDB/addParkingBylaw");
const parkingDB_updateParkingBylaw = require("../helpers/parkingDB/updateParkingBylaw");
const parkingDB_deleteParkingBylaw = require("../helpers/parkingDB/deleteParkingBylaw");
const parkingDB_getParkingLocations = require("../helpers/parkingDB/getParkingLocations");
const parkingDB_addParkingLocation = require("../helpers/parkingDB/addParkingLocation");
const parkingDB_updateParkingLocation = require("../helpers/parkingDB/updateParkingLocation");
const parkingDB_deleteParkingLocation = require("../helpers/parkingDB/deleteParkingLocation");
const parkingDB_getParkingOffences = require("../helpers/parkingDB/getParkingOffences");
const parkingDB_addParkingOffence = require("../helpers/parkingDB/addParkingOffence");
const parkingDB_updateParkingOffence = require("../helpers/parkingDB/updateParkingOffence");
const parkingDB_deleteParkingOffence = require("../helpers/parkingDB/deleteParkingOffence");
const userFns_1 = require("../helpers/userFns");
const configFns = require("../helpers/configFns");
const router = express_1.Router();
router.get("/userManagement", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return res.redirect("/dashboard/?error=accessDenied");
    }
    const users = usersDB.getAllUsers();
    return res.render("admin-userManagement", {
        headTitle: "User Management",
        users
    });
});
router.post("/doCreateUser", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const newPassword = usersDB.createUser(req.body);
    if (!newPassword) {
        res.json({
            success: false,
            message: "New Account Not Created"
        });
    }
    else {
        res.json({
            success: true,
            newPassword
        });
    }
});
router.post("/doUpdateUser", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const changeCount = usersDB.updateUser(req.body);
    res.json({
        success: (changeCount === 1)
    });
});
router.post("/doUpdateUserProperty", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const changeCount = usersDB.updateUserProperty(req.body);
    res.json({
        success: (changeCount === 1)
    });
});
router.post("/doResetPassword", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const newPassword = usersDB.generateNewPassword(req.body.userName);
    res.json({
        success: true,
        newPassword
    });
});
router.post("/doGetUserProperties", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const userProperties = usersDB.getUserProperties(req.body.userName);
    res.json(userProperties);
});
router.post("/doDeleteUser", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const userNameToDelete = req.body.userName;
    if (userNameToDelete === req.session.user.userName) {
        return userFns_1.forbiddenJSON(res);
    }
    const success = usersDB.inactivateUser(userNameToDelete);
    res.json({ success });
});
router.get("/cleanup", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return res.redirect("/dashboard/?error=accessDenied");
    }
    const counts = parkingDBCleanup.getDatabaseCleanupCounts();
    res.render("admin-cleanup", {
        headTitle: "Database Cleanup",
        counts
    });
});
router.post("/doCleanupTable", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const table = req.body.table;
    const recordDelete_timeMillis = Math.min(parseInt(req.body.recordDelete_timeMillis, 10), Date.now() - (configFns.getProperty("databaseCleanup.windowDays") * 86400 * 1000));
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
module.exports = router;
