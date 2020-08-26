"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_createLookupBatch = require("../../helpers/parkingDB/createLookupBatch");
exports.handler = (req, res) => {
    const createBatchResponse = parkingDB_createLookupBatch.createLookupBatch(req.session);
    return res.json(createBatchResponse);
};
