"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getUnreceivedLookupBatches = require("../../helpers/parkingDB/getUnreceivedLookupBatches");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!(userFns_1.userCanUpdate(req) || userFns_1.userIsOperator(req))) {
        return userFns_1.forbiddenJSON(res);
    }
    const batches = parkingDB_getUnreceivedLookupBatches.getUnreceivedLookupBatches(req.session.user.userProperties.canUpdate);
    return res.json(batches);
};
