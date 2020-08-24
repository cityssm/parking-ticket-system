"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_createLookupBatch = require("../../helpers/parkingDB/createLookupBatch");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const createBatchResponse = parkingDB_createLookupBatch.createLookupBatch(req.session);
    return res.json(createBatchResponse);
};
