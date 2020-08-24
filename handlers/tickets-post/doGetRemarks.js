"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingTicketRemarks = require("../../helpers/parkingDB/getParkingTicketRemarks");
exports.handler = (req, res) => {
    return res.json(parkingDB_getParkingTicketRemarks.getParkingTicketRemarks(req.body.ticketID, req.session));
};
