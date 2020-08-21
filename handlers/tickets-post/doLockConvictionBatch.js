"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_lockConvictionBatch = require("../../helpers/parkingDB/lockConvictionBatch");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const batchID = req.body.batchID;
    const result = parkingDB_lockConvictionBatch.lockConvictionBatch(batchID, req.session);
    return res.json(result);
};
