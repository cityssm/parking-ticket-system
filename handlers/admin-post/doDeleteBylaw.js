"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingBylaws = require("../../helpers/parkingDB/getParkingBylaws");
const parkingDB_deleteParkingBylaw = require("../../helpers/parkingDB/deleteParkingBylaw");
exports.handler = (req, res) => {
    const results = parkingDB_deleteParkingBylaw.deleteParkingBylaw(req.body.bylawNumber);
    if (results.success) {
        results.bylaws = parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats();
    }
    return res.json(results);
};
