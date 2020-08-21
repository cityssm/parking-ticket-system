"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_createConvictionBatch = require("../../helpers/parkingDB/createConvictionBatch");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const batchResult = parkingDB_createConvictionBatch.createConvictionBatch(req.session);
    return res.json(batchResult);
};
