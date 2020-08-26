"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingLocations = require("../../helpers/parkingDB/getParkingLocations");
const parkingDB_updateParkingLocation = require("../../helpers/parkingDB/updateParkingLocation");
exports.handler = (req, res) => {
    const results = parkingDB_updateParkingLocation.updateParkingLocation(req.body);
    if (results.success) {
        results.locations = parkingDB_getParkingLocations.getParkingLocations();
    }
    return res.json(results);
};
