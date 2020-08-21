"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_unlockConvictionBatch = require("../../helpers/parkingDB/unlockConvictionBatch");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const batchID = req.body.batchID;
    const success = parkingDB_unlockConvictionBatch.unlockConvictionBatch(batchID, req.session);
    return res.json({ success });
};
