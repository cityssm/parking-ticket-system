"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getConvictionBatch = require("../../helpers/parkingDB/getConvictionBatch");
exports.handler = (req, res) => {
    const batch = parkingDB_getConvictionBatch.getConvictionBatch(req.body.batchID);
    return res.json(batch);
};
