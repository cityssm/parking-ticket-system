"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingLocations = require("../../helpers/parkingDB/getParkingLocations");
const parkingDB_getParkingBylaws = require("../../helpers/parkingDB/getParkingBylaws");
const parkingDB_getParkingOffences = require("../../helpers/parkingDB/getParkingOffences");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return res.redirect("/dashboard/?error=accessDenied");
    }
    const locations = parkingDB_getParkingLocations.getParkingLocations();
    const bylaws = parkingDB_getParkingBylaws.getParkingBylaws();
    const offences = parkingDB_getParkingOffences.getParkingOffences();
    return res.render("offence-maint", {
        headTitle: "Parking Offences",
        locations,
        bylaws,
        offences
    });
};
