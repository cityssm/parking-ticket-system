"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_deleteParkingTicketStatus = require("../../helpers/parkingDB/deleteParkingTicketStatus");
exports.handler = (req, res) => {
    const result = parkingDB_deleteParkingTicketStatus.deleteParkingTicketStatus(req.body.ticketID, req.body.statusIndex, req.session);
    return res.json(result);
};
