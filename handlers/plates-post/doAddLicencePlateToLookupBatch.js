"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getLookupBatch = require("../../helpers/parkingDB/getLookupBatch");
const parkingDB_addLicencePlateToLookupBatch = require("../../helpers/parkingDB/addLicencePlateToLookupBatch");
exports.handler = (req, res) => {
    const result = parkingDB_addLicencePlateToLookupBatch.addLicencePlateToLookupBatch(req.body, req.session);
    if (result.success) {
        result.batch = parkingDB_getLookupBatch.getLookupBatch(req.body.batchID);
    }
    return res.json(result);
};
