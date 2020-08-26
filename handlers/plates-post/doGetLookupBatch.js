"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getLookupBatch = require("../../helpers/parkingDB/getLookupBatch");
exports.handler = (req, res) => {
    const batch = parkingDB_getLookupBatch.getLookupBatch(req.body.batchID);
    return res.json(batch);
};
