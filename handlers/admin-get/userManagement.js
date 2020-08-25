"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const usersDB_getAllUsers = require("../../helpers/usersDB/getAllUsers");
exports.handler = (_req, res) => {
    const users = usersDB_getAllUsers.getAllUsers();
    return res.render("admin-userManagement", {
        headTitle: "User Management",
        users
    });
};
