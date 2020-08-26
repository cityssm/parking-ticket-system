"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getLastTenConvictionBatches = require("../../helpers/parkingDB/getLastTenConvictionBatches");
exports.handler = (_req, res) => {
    const batches = parkingDB_getLastTenConvictionBatches.getLastTenConvictionBatches();
    return res.json(batches);
};
