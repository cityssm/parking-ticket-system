"use strict";
const express_1 = require("express");
const router = express_1.Router();
const configFns = require("../helpers/configFns");
const usersDB = require("../helpers/usersDB");
router.route("/")
    .get(function (req, res) {
    const sessionCookieName = configFns.getProperty("session.cookieName");
    if (req.session.user && req.cookies[sessionCookieName]) {
        if (req.query.redirect && req.query.redirect !== "") {
            res.redirect(req.query.redirect);
        }
        else {
            res.redirect("/dashboard");
        }
    }
    else {
        res.render("login", {
            userName: "",
            message: "",
            redirect: req.query.redirect
        });
    }
})
    .post(function (req, res) {
    const userName = req.body.userName;
    const passwordPlain = req.body.password;
    const redirectURL = req.body.redirect;
    const userObj = usersDB.getUser(userName, passwordPlain);
    if (userObj) {
        req.session.user = userObj;
        if (redirectURL && redirectURL !== "") {
            res.redirect(req.body.redirect);
        }
        else {
            res.redirect("/dashboard");
        }
    }
    else {
        res.render("login", {
            userName: userName,
            message: "Login Failed",
            redirect: redirectURL
        });
    }
});
module.exports = router;
