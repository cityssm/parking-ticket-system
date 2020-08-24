"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getDatabaseCleanupCounts = require("../../helpers/parkingDB/getDatabaseCleanupCounts");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return res.redirect("/dashboard/?error=accessDenied");
    }
    const counts = parkingDB_getDatabaseCleanupCounts.getDatabaseCleanupCounts();
    return res.render("admin-cleanup", {
        headTitle: "Database Cleanup",
        counts
    });
};
