"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_ontario = require("../../helpers/parkingDB-ontario");
const parkingDB_clearConvictionBatch = require("../../helpers/parkingDB/clearConvictionBatch");
const parkingDB_getConvictionBatch = require("../../helpers/parkingDB/getConvictionBatch");
exports.handler = (req, res) => {
    const batchID = req.body.batchID;
    const result = parkingDB_clearConvictionBatch.clearConvictionBatch(batchID, req.session);
    if (result.success) {
        result.batch = parkingDB_getConvictionBatch.getConvictionBatch(batchID);
        result.tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
    }
    return res.json(result);
};
