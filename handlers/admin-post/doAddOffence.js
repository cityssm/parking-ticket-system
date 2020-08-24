"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingOffences = require("../../helpers/parkingDB/getParkingOffences");
const parkingDB_addParkingOffence = require("../../helpers/parkingDB/addParkingOffence");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const results = parkingDB_addParkingOffence.addParkingOffence(req.body);
    if (results.success && req.body.returnOffences) {
        results.offences = parkingDB_getParkingOffences.getParkingOffences();
    }
    res.json(results);
};
