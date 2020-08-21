"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getLastTenConvictionBatches = require("../../helpers/parkingDB/getLastTenConvictionBatches");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!(userFns_1.userCanUpdate(req) || userFns_1.userIsOperator(req))) {
        return userFns_1.forbiddenJSON(res);
    }
    const batches = parkingDB_getLastTenConvictionBatches.getLastTenConvictionBatches();
    return res.json(batches);
};
