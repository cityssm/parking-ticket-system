"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const usersDB_getAllUsers = require("../../helpers/usersDB/getAllUsers");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return res.redirect("/dashboard/?error=accessDenied");
    }
    const users = usersDB_getAllUsers.getAllUsers();
    return res.render("admin-userManagement", {
        headTitle: "User Management",
        users
    });
};
