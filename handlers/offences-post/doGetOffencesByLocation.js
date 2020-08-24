"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingOffences = require("../../helpers/parkingDB/getParkingOffences");
exports.handler = (req, res) => {
    res.json(parkingDB_getParkingOffences.getParkingOffencesByLocationKey(req.body.locationKey));
};
