"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getDatabaseCleanupCounts = require("../../helpers/parkingDB/getDatabaseCleanupCounts");
exports.handler = (_req, res) => {
    const counts = parkingDB_getDatabaseCleanupCounts.getDatabaseCleanupCounts();
    return res.render("admin-cleanup", {
        headTitle: "Database Cleanup",
        counts
    });
};
