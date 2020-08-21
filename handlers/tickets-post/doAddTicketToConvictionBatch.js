"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_addParkingTicketToConvictionBatch = require("../../helpers/parkingDB/addParkingTicketToConvictionBatch");
const parkingDB_getConvictionBatch = require("../../helpers/parkingDB/getConvictionBatch");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const batchID = req.body.batchID;
    const ticketID = req.body.ticketID;
    const result = parkingDB_addParkingTicketToConvictionBatch.addParkingTicketToConvictionBatch(batchID, ticketID, req.session);
    if (result.success) {
        result.batch = parkingDB_getConvictionBatch.getConvictionBatch(batchID);
    }
    return res.json(result);
};
