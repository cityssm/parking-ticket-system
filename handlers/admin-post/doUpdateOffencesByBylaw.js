"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingBylaws = require("../../helpers/parkingDB/getParkingBylaws");
const parkingDB_updateParkingOffencesByBylawNumber = require("../../helpers/parkingDB/updateParkingOffencesByBylawNumber");
exports.handler = (req, res) => {
    const results = parkingDB_updateParkingOffencesByBylawNumber.updateParkingOffencesByBylawNumber(req.body);
    if (results.success) {
        results.bylaws = parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats();
    }
    return res.json(results);
};
