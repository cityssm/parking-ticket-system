"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingBylaws = require("../../helpers/parkingDB/getParkingBylaws");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return res.redirect("/dashboard/?error=accessDenied");
    }
    const bylaws = parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats();
    return res.render("bylaw-maint", {
        headTitle: "By-Law Maintenance",
        bylaws
    });
};
