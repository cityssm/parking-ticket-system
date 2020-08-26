"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingLocations = require("../../helpers/parkingDB/getParkingLocations");
const parkingDB_deleteParkingLocation = require("../../helpers/parkingDB/deleteParkingLocation");
exports.handler = (req, res) => {
    const results = parkingDB_deleteParkingLocation.deleteParkingLocation(req.body.locationKey);
    if (results.success) {
        results.locations = parkingDB_getParkingLocations.getParkingLocations();
    }
    return res.json(results);
};
