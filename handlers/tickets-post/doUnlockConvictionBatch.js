"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_unlockConvictionBatch = require("../../helpers/parkingDB/unlockConvictionBatch");
exports.handler = (req, res) => {
    const batchID = req.body.batchID;
    const success = parkingDB_unlockConvictionBatch.unlockConvictionBatch(batchID, req.session);
    return res.json({ success });
};
