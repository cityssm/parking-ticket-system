"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getLookupBatch = require("../../helpers/parkingDB/getLookupBatch");
const parkingDB_lockLookupBatch = require("../../helpers/parkingDB/lockLookupBatch");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const batchID = parseInt(req.body.batchID, 10);
    const result = parkingDB_lockLookupBatch.lockLookupBatch(batchID, req.session);
    if (result.success) {
        result.batch = parkingDB_getLookupBatch.getLookupBatch(batchID);
    }
    return res.json(result);
};
