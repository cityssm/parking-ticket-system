"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_ontario = require("../../helpers/parkingDB-ontario");
exports.handler = (req, res) => {
    const batchID = parseInt(req.body.batchID, 10);
    const issueDaysAgo = parseInt(req.body.issueDaysAgo, 10);
    const availablePlates = parkingDB_ontario.getLicencePlatesAvailableForMTOLookupBatch(batchID, issueDaysAgo);
    return res.json(availablePlates);
};
