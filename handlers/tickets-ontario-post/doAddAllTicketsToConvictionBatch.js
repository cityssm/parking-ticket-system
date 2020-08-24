"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_ontario = require("../../helpers/parkingDB-ontario");
const parkingDB_addParkingTicketToConvictionBatch = require("../../helpers/parkingDB/addParkingTicketToConvictionBatch");
const parkingDB_getConvictionBatch = require("../../helpers/parkingDB/getConvictionBatch");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const batchID = req.body.batchID;
    const ticketIDs = req.body.ticketIDs;
    const result = parkingDB_addParkingTicketToConvictionBatch.addAllParkingTicketsToConvictionBatch(batchID, ticketIDs, req.session);
    if (result.successCount > 0) {
        result.batch = parkingDB_getConvictionBatch.getConvictionBatch(batchID);
        result.tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
    }
    return res.json(result);
};
