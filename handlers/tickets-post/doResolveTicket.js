"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_resolveParkingTicket = require("../../helpers/parkingDB/resolveParkingTicket");
exports.handler = (req, res) => {
    const result = parkingDB_resolveParkingTicket.resolveParkingTicket(req.body.ticketID, req.session);
    return res.json(result);
};
