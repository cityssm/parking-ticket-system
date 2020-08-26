"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getLookupBatch = require("../../helpers/parkingDB/getLookupBatch");
const parkingDB_clearLookupBatch = require("../../helpers/parkingDB/clearLookupBatch");
exports.handler = (req, res) => {
    const batchID = parseInt(req.body.batchID, 10);
    const result = parkingDB_clearLookupBatch.clearLookupBatch(batchID, req.session);
    if (result.success) {
        result.batch = parkingDB_getLookupBatch.getLookupBatch(batchID);
    }
    return res.json(result);
};
