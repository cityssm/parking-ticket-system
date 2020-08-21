"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getConvictionBatch = require("../../helpers/parkingDB/getConvictionBatch");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!(userFns_1.userCanUpdate(req) || userFns_1.userIsOperator(req))) {
        return userFns_1.forbiddenJSON(res);
    }
    const batch = parkingDB_getConvictionBatch.getConvictionBatch(req.body.batchID);
    return res.json(batch);
};
