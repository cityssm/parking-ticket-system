"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getUnreceivedLookupBatches = require("../../helpers/parkingDB/getUnreceivedLookupBatches");
exports.handler = (req, res) => {
    const batches = parkingDB_getUnreceivedLookupBatches.getUnreceivedLookupBatches(req.session.user.userProperties.canUpdate);
    return res.json(batches);
};
