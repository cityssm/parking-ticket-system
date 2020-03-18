"use strict";
const express = require("express");
const router = express.Router();
const usersDB = require("../helpers/usersDB");
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
module.exports = router;
