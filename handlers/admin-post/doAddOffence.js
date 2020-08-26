"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingOffences = require("../../helpers/parkingDB/getParkingOffences");
const parkingDB_addParkingOffence = require("../../helpers/parkingDB/addParkingOffence");
exports.handler = (req, res) => {
    const results = parkingDB_addParkingOffence.addParkingOffence(req.body);
    if (results.success && req.body.returnOffences) {
        results.offences = parkingDB_getParkingOffences.getParkingOffences();
    }
    res.json(results);
};
