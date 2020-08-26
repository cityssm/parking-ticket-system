"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_lockConvictionBatch = require("../../helpers/parkingDB/lockConvictionBatch");
exports.handler = (req, res) => {
    const batchID = req.body.batchID;
    const result = parkingDB_lockConvictionBatch.lockConvictionBatch(batchID, req.session);
    return res.json(result);
};
