"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingOffences = require("../../helpers/parkingDB/getParkingOffences");
const parkingDB_updateParkingOffence = require("../../helpers/parkingDB/updateParkingOffence");
exports.handler = (req, res) => {
    const results = parkingDB_updateParkingOffence.updateParkingOffence(req.body);
    if (results.success) {
        results.offences = parkingDB_getParkingOffences.getParkingOffences();
    }
    return res.json(results);
};
