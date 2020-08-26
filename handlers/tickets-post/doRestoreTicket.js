"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_restoreParkingTicket = require("../../helpers/parkingDB/restoreParkingTicket");
exports.handler = (req, res) => {
    const result = parkingDB_restoreParkingTicket.restoreParkingTicket(req.body.ticketID, req.session);
    return res.json(result);
};
