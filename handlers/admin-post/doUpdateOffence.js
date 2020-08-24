"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingOffences = require("../../helpers/parkingDB/getParkingOffences");
const parkingDB_updateParkingOffence = require("../../helpers/parkingDB/updateParkingOffence");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const results = parkingDB_updateParkingOffence.updateParkingOffence(req.body);
    if (results.success) {
        results.offences = parkingDB_getParkingOffences.getParkingOffences();
    }
    return res.json(results);
};
