"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_deleteParkingTicket = require("../../helpers/parkingDB/deleteParkingTicket");
exports.handler = (req, res) => {
    const result = parkingDB_deleteParkingTicket.deleteParkingTicket(req.body.ticketID, req.session);
    return res.json(result);
};
