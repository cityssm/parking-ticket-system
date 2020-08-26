"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_addLicencePlateToLookupBatch = require("../../helpers/parkingDB/addLicencePlateToLookupBatch");
exports.handler = (req, res) => {
    const result = parkingDB_addLicencePlateToLookupBatch.addAllLicencePlatesToLookupBatch(req.body, req.session);
    return res.json(result);
};
