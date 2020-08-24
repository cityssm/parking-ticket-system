"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getLookupBatch = require("../../helpers/parkingDB/getLookupBatch");
const parkingDB_addLicencePlateToLookupBatch = require("../../helpers/parkingDB/addLicencePlateToLookupBatch");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_addLicencePlateToLookupBatch.addLicencePlateToLookupBatch(req.body, req.session);
    if (result.success) {
        result.batch = parkingDB_getLookupBatch.getLookupBatch(req.body.batchID);
    }
    return res.json(result);
};
