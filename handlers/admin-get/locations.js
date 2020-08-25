"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingLocations = require("../../helpers/parkingDB/getParkingLocations");
exports.handler = (_req, res) => {
    const locations = parkingDB_getParkingLocations.getParkingLocations();
    return res.render("location-maint", {
        headTitle: "Parking Location Maintenance",
        locations
    });
};
