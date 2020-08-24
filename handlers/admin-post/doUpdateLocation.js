"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingLocations = require("../../helpers/parkingDB/getParkingLocations");
const parkingDB_updateParkingLocation = require("../../helpers/parkingDB/updateParkingLocation");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const results = parkingDB_updateParkingLocation.updateParkingLocation(req.body);
    if (results.success) {
        results.locations = parkingDB_getParkingLocations.getParkingLocations();
    }
    return res.json(results);
};
