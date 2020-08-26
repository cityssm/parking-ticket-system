"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_ontario = require("../../helpers/parkingDB-ontario");
const parkingDB_removeParkingTicketFromConvictionBatch = require("../../helpers/parkingDB/removeParkingTicketFromConvictionBatch");
exports.handler = (req, res) => {
    const batchID = req.body.batchID;
    const ticketID = req.body.ticketID;
    const result = parkingDB_removeParkingTicketFromConvictionBatch.removeParkingTicketFromConvictionBatch(batchID, ticketID, req.session);
    if (result.success) {
        result.tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
    }
    return res.json(result);
};
