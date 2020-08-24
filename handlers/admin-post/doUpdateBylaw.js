"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingBylaws = require("../../helpers/parkingDB/getParkingBylaws");
const parkingDB_updateParkingBylaw = require("../../helpers/parkingDB/updateParkingBylaw");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const results = parkingDB_updateParkingBylaw.updateParkingBylaw(req.body);
    if (results.success) {
        results.bylaws = parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats();
    }
    return res.json(results);
};
