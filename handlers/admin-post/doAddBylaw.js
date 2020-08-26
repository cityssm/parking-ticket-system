"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingBylaws = require("../../helpers/parkingDB/getParkingBylaws");
const parkingDB_addParkingBylaw = require("../../helpers/parkingDB/addParkingBylaw");
exports.handler = (req, res) => {
    const results = parkingDB_addParkingBylaw.addParkingBylaw(req.body);
    if (results.success) {
        results.bylaws = parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats();
    }
    return res.json(results);
};
