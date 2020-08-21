"use strict";
const express_1 = require("express");
const usersDB_getAllUsers = require("../helpers/usersDB/getAllUsers");
const usersDB_getUserProperties = require("../helpers/usersDB/getUserProperties");
const usersDB_createUser = require("../helpers/usersDB/createUser");
const usersDB_updateUser = require("../helpers/usersDB/updateUser");
const usersDB_updateUserProperty = require("../helpers/usersDB/updateUserProperty");
const usersDB_generateNewPassword = require("../helpers/usersDB/generateNewPassword");
const usersDB_inactivateUser = require("../helpers/usersDB/inactivateUser");
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
const parkingDB_updateParkingOffencesByBylawNumber = require("../helpers/parkingDB/updateParkingOffencesByBylawNumber");
const parkingDB_deleteParkingOffence = require("../helpers/parkingDB/deleteParkingOffence");
const parkingDB_getDatabaseCleanupCounts = require("../helpers/parkingDB/getDatabaseCleanupCounts");
const parkingDB_cleanupParkingBylawsTable = require("../helpers/parkingDB/cleanupParkingBylawsTable");
const parkingDB_cleanupParkingOffencesTable = require("../helpers/parkingDB/cleanupParkingOffencesTable");
const parkingDB_cleanupParkingLocationsTable = require("../helpers/parkingDB/cleanupParkingLocationsTable");
const parkingDB_cleanupParkingTicketsTable = require("../helpers/parkingDB/cleanupParkingTicketsTable");
const parkingDB_cleanupParkingTicketStatusLog = require("../helpers/parkingDB/cleanupParkingTicketStatusLog");
const parkingDB_cleanupParkingTicketRemarksTable = require("../helpers/parkingDB/cleanupParkingTicketRemarksTable");
const parkingDB_cleanupLicencePlateOwnersTable = require("../helpers/parkingDB/cleanupLicencePlateOwnersTable");
const userFns_1 = require("../helpers/userFns");
const configFns = require("../helpers/configFns");
const router = express_1.Router();
router.get("/userManagement", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return res.redirect("/dashboard/?error=accessDenied");
    }
    const users = usersDB_getAllUsers.getAllUsers();
    return res.render("admin-userManagement", {
        headTitle: "User Management",
        users
    });
});
router.post("/doCreateUser", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const newPassword = usersDB_createUser.createUser(req.body);
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
    const changeCount = usersDB_updateUser.updateUser(req.body);
    res.json({
        success: (changeCount === 1)
    });
});
router.post("/doUpdateUserProperty", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const changeCount = usersDB_updateUserProperty.updateUserProperty(req.body);
    res.json({
        success: (changeCount === 1)
    });
});
router.post("/doResetPassword", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const newPassword = usersDB_generateNewPassword.generateNewPassword(req.body.userName);
    res.json({
        success: true,
        newPassword
    });
});
router.post("/doGetUserProperties", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const userProperties = usersDB_getUserProperties.getUserProperties(req.body.userName);
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
    const success = usersDB_inactivateUser.inactivateUser(userNameToDelete);
    res.json({ success });
});
router.get("/cleanup", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return res.redirect("/dashboard/?error=accessDenied");
    }
    const counts = parkingDB_getDatabaseCleanupCounts.getDatabaseCleanupCounts();
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
            success = parkingDB_cleanupParkingTicketsTable.cleanupParkingTicketsTable(recordDelete_timeMillis);
            break;
        case "parkingTicketRemarks":
            success = parkingDB_cleanupParkingTicketRemarksTable.cleanupParkingTicketRemarksTable(recordDelete_timeMillis);
            break;
        case "parkingTicketStatusLog":
            success = parkingDB_cleanupParkingTicketStatusLog.cleanupParkingTicketStatusLog(recordDelete_timeMillis);
            break;
        case "licencePlateOwners":
            success = parkingDB_cleanupLicencePlateOwnersTable.cleanupLicencePlateOwnersTable(recordDelete_timeMillis);
            break;
        case "parkingOffences":
            success = parkingDB_cleanupParkingOffencesTable.cleanupParkingOffencesTable();
            break;
        case "parkingLocations":
            success = parkingDB_cleanupParkingLocationsTable.cleanupParkingLocationsTable();
            break;
        case "parkingBylaws":
            success = parkingDB_cleanupParkingBylawsTable.cleanupParkingBylawsTable();
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
