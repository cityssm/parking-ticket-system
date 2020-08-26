"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_unresolveParkingTicket = require("../../helpers/parkingDB/unresolveParkingTicket");
exports.handler = (req, res) => {
    const result = parkingDB_unresolveParkingTicket.unresolveParkingTicket(req.body.ticketID, req.session);
    return res.json(result);
};
