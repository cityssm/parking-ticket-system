"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_ontario = require("../../helpers/parkingDB-ontario");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const batchID = parseInt(req.body.batchID, 10);
    const issueDaysAgo = parseInt(req.body.issueDaysAgo, 10);
    const availablePlates = parkingDB_ontario.getLicencePlatesAvailableForMTOLookupBatch(batchID, issueDaysAgo);
    return res.json(availablePlates);
};
