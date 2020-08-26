"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_addParkingTicketToConvictionBatch = require("../../helpers/parkingDB/addParkingTicketToConvictionBatch");
const parkingDB_getConvictionBatch = require("../../helpers/parkingDB/getConvictionBatch");
exports.handler = (req, res) => {
    const batchID = req.body.batchID;
    const ticketID = req.body.ticketID;
    const result = parkingDB_addParkingTicketToConvictionBatch.addParkingTicketToConvictionBatch(batchID, ticketID, req.session);
    if (result.success) {
        result.batch = parkingDB_getConvictionBatch.getConvictionBatch(batchID);
    }
    return res.json(result);
};
