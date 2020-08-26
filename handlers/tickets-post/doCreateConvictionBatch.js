"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_createConvictionBatch = require("../../helpers/parkingDB/createConvictionBatch");
exports.handler = (req, res) => {
    const batchResult = parkingDB_createConvictionBatch.createConvictionBatch(req.session);
    return res.json(batchResult);
};
