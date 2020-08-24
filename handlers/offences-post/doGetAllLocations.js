"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingLocations = require("../../helpers/parkingDB/getParkingLocations");
exports.handler = (_req, res) => {
    res.json(parkingDB_getParkingLocations.getParkingLocations());
};
