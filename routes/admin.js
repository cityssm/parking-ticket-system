"use strict";
const express_1 = require("express");
const router = express_1.Router();
const usersDB = require("../helpers/usersDB");
const parkingDB = require("../helpers/parkingDB");
const configFns = require("../helpers/configFns");
router.get("/userManagement", function (req, res) {
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
router.post("/doCreateUser", function (req, res) {
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
    }
    else {
        res.json({
            success: true,
            newPassword: newPassword
        });
    }
});
router.post("/doUpdateUser", function (req, res) {
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
router.post("/doUpdateUserProperty", function (req, res) {
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
router.post("/doResetPassword", function (req, res) {
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
router.post("/doGetUserProperties", function (req, res) {
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
router.post("/doDeleteUser", function (req, res) {
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
    });
});
router.get("/cleanup", function (req, res) {
    if (!req.session.user.userProperties.isAdmin) {
        res.redirect("/dashboard/?error=accessDenied");
        return;
    }
    const counts = parkingDB.getDatabaseCleanupCounts();
    res.render("admin-cleanup", {
        headTitle: "Database Cleanup",
        counts: counts
    });
});
router.post("/doCleanupTable", function (req, res) {
    if (!req.session.user.userProperties.isAdmin) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const table = req.body.table;
    const recordDelete_timeMillis = Math.min(parseInt(req.body.recordDelete_timeMillis), Date.now() - (configFns.getProperty("databaseCleanup.windowDays") * 86400 * 1000));
    let success = false;
    switch (table) {
        case "parkingTickets":
            success = parkingDB.cleanupParkingTicketsTable(recordDelete_timeMillis);
            break;
        case "parkingTicketRemarks":
            success = parkingDB.cleanupParkingTicketRemarksTable(recordDelete_timeMillis);
            break;
        case "parkingTicketStatusLog":
            success = parkingDB.cleanupParkingTicketStatusLog(recordDelete_timeMillis);
            break;
        case "licencePlateOwners":
            success = parkingDB.cleanupLicencePlateOwnersTable(recordDelete_timeMillis);
            break;
        case "parkingOffences":
            success = parkingDB.cleanupParkingOffencesTable();
            break;
        case "parkingLocations":
            success = parkingDB.cleanupParkingLocationsTable();
            break;
        case "parkingBylaws":
            success = parkingDB.cleanupParkingBylawsTable();
            break;
    }
    res.json({
        success: success
    });
});
router.get("/offences", function (_req, res) {
    const locations = parkingDB.getParkingLocations();
    const bylaws = parkingDB.getParkingBylaws();
    const offences = parkingDB.getParkingOffences();
    res.render("offence-maint", {
        headTitle: "Parking Offences",
        locations: locations,
        bylaws: bylaws,
        offences: offences
    });
});
router.post("/doAddOffence", function (req, res) {
    const results = parkingDB.addParkingOffence(req.body);
    if (results.success && req.body.returnOffences) {
        results.offences = parkingDB.getParkingOffences();
    }
    res.json(results);
});
router.post("/doUpdateOffence", function (req, res) {
    const results = parkingDB.updateParkingOffence(req.body);
    if (results.success) {
        results.offences = parkingDB.getParkingOffences();
    }
    res.json(results);
});
router.post("/doDeleteOffence", function (req, res) {
    const results = parkingDB.deleteParkingOffence(req.body.bylawNumber, req.body.locationKey);
    if (results.success) {
        results.offences = parkingDB.getParkingOffences();
    }
    res.json(results);
});
router.get("/locations", function (_req, res) {
    const locations = parkingDB.getParkingLocations();
    res.render("location-maint", {
        headTitle: "Parking Location Maintenance",
        locations: locations
    });
});
router.post("/doAddLocation", function (req, res) {
    const results = parkingDB.addParkingLocation(req.body);
    if (results.success) {
        results.locations = parkingDB.getParkingLocations();
    }
    res.json(results);
});
router.post("/doUpdateLocation", function (req, res) {
    const results = parkingDB.updateParkingLocation(req.body);
    if (results.success) {
        results.locations = parkingDB.getParkingLocations();
    }
    res.json(results);
});
router.post("/doDeleteLocation", function (req, res) {
    const results = parkingDB.deleteParkingLocation(req.body.locationKey);
    if (results.success) {
        results.locations = parkingDB.getParkingLocations();
    }
    res.json(results);
});
router.get("/bylaws", function (_req, res) {
    const bylaws = parkingDB.getParkingBylaws();
    res.render("bylaw-maint", {
        headTitle: "By-Law Maintenance",
        bylaws: bylaws
    });
});
router.post("/doAddBylaw", function (req, res) {
    const results = parkingDB.addParkingBylaw(req.body);
    if (results.success) {
        results.bylaws = parkingDB.getParkingBylaws();
    }
    res.json(results);
});
router.post("/doUpdateBylaw", function (req, res) {
    const results = parkingDB.updateParkingBylaw(req.body);
    if (results.success) {
        results.bylaws = parkingDB.getParkingBylaws();
    }
    res.json(results);
});
router.post("/doDeleteBylaw", function (req, res) {
    const results = parkingDB.deleteParkingBylaw(req.body.bylawNumber);
    if (results.success) {
        results.bylaws = parkingDB.getParkingBylaws();
    }
    res.json(results);
});
module.exports = router;
