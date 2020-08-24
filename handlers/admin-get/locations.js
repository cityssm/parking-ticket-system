"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingLocations = require("../../helpers/parkingDB/getParkingLocations");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return res.redirect("/dashboard/?error=accessDenied");
    }
    const locations = parkingDB_getParkingLocations.getParkingLocations();
    return res.render("location-maint", {
        headTitle: "Parking Location Maintenance",
        locations
    });
};
