"use strict";
const express_1 = require("express");
const router = express_1.Router();
const usersDB = require("../helpers/usersDB");
const parkingDBCleanup = require("../helpers/parkingDB-cleanup");
const parkingDBRelated = require("../helpers/parkingDB-related");
const configFns = require("../helpers/configFns");
router.get("/userManagement", function (req, res) {
    if (!req.session.user.userProperties.isAdmin) {
        res.redirect("/dashboard/?error=accessDenied");
        return;
    }
    const users = usersDB.getAllUsers();
    res.render("admin-userManagement", {
        headTitle: "User Management",
        users
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
            newPassword
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
    const counts = parkingDBCleanup.getDatabaseCleanupCounts();
    res.render("admin-cleanup", {
        headTitle: "Database Cleanup",
        counts
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
    res.json({
        success: success
    });
});
router.get("/offences", function (_req, res) {
    const locations = parkingDBRelated.getParkingLocations();
    const bylaws = parkingDBRelated.getParkingBylaws();
    const offences = parkingDBRelated.getParkingOffences();
    res.render("offence-maint", {
        headTitle: "Parking Offences",
        locations,
        bylaws,
        offences
    });
});
router.post("/doAddOffence", function (req, res) {
    const results = parkingDBRelated.addParkingOffence(req.body);
    if (results.success && req.body.returnOffences) {
        results.offences = parkingDBRelated.getParkingOffences();
    }
    res.json(results);
});
router.post("/doUpdateOffence", function (req, res) {
    const results = parkingDBRelated.updateParkingOffence(req.body);
    if (results.success) {
        results.offences = parkingDBRelated.getParkingOffences();
    }
    res.json(results);
});
router.post("/doDeleteOffence", function (req, res) {
    const results = parkingDBRelated.deleteParkingOffence(req.body.bylawNumber, req.body.locationKey);
    if (results.success) {
        results.offences = parkingDBRelated.getParkingOffences();
    }
    res.json(results);
});
router.get("/locations", function (_req, res) {
    const locations = parkingDBRelated.getParkingLocations();
    res.render("location-maint", {
        headTitle: "Parking Location Maintenance",
        locations
    });
});
router.post("/doAddLocation", function (req, res) {
    const results = parkingDBRelated.addParkingLocation(req.body);
    if (results.success) {
        results.locations = parkingDBRelated.getParkingLocations();
    }
    res.json(results);
});
router.post("/doUpdateLocation", function (req, res) {
    const results = parkingDBRelated.updateParkingLocation(req.body);
    if (results.success) {
        results.locations = parkingDBRelated.getParkingLocations();
    }
    res.json(results);
});
router.post("/doDeleteLocation", function (req, res) {
    const results = parkingDBRelated.deleteParkingLocation(req.body.locationKey);
    if (results.success) {
        results.locations = parkingDBRelated.getParkingLocations();
    }
    res.json(results);
});
router.get("/bylaws", function (_req, res) {
    const bylaws = parkingDBRelated.getParkingBylawsWithOffenceStats();
    res.render("bylaw-maint", {
        headTitle: "By-Law Maintenance",
        bylaws
    });
});
router.post("/doAddBylaw", function (req, res) {
    const results = parkingDBRelated.addParkingBylaw(req.body);
    if (results.success) {
        results.bylaws = parkingDBRelated.getParkingBylawsWithOffenceStats();
    }
    res.json(results);
});
router.post("/doUpdateBylaw", function (req, res) {
    const results = parkingDBRelated.updateParkingBylaw(req.body);
    if (results.success) {
        results.bylaws = parkingDBRelated.getParkingBylawsWithOffenceStats();
    }
    res.json(results);
});
router.post("/doUpdateOffencesByBylaw", function (req, res) {
    const results = parkingDBRelated.updateParkingOffencesByBylawNumber(req.body);
    if (results.success) {
        results.bylaws = parkingDBRelated.getParkingBylawsWithOffenceStats();
    }
    res.json(results);
});
router.post("/doDeleteBylaw", function (req, res) {
    const results = parkingDBRelated.deleteParkingBylaw(req.body.bylawNumber);
    if (results.success) {
        results.bylaws = parkingDBRelated.getParkingBylawsWithOffenceStats();
    }
    res.json(results);
});
module.exports = router;
