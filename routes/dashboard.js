"use strict";
const express = require("express");
const router = express.Router();
const usersDB = require("../helpers/usersDB");
router.get("/", function (_req, res) {
    res.render("dashboard", {
        headTitle: "Dashboard"
    });
});
router.post("/doChangePassword", function (req, res) {
    const userName = req.session.user.userName;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const result = usersDB.tryResetPassword(userName, oldPassword, newPassword);
    res.json(result);
});
router.all("/doGetDefaultConfigProperties", function (_req, res) {
    res.json({});
});
module.exports = router;
