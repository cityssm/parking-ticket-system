"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingLocations = require("../../helpers/parkingDB/getParkingLocations");
const parkingDB_addParkingLocation = require("../../helpers/parkingDB/addParkingLocation");
exports.handler = (req, res) => {
    const results = parkingDB_addParkingLocation.addParkingLocation(req.body);
    if (results.success) {
        results.locations = parkingDB_getParkingLocations.getParkingLocations();
    }
    return res.json(results);
};
