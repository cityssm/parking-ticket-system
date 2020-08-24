"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingTicketStatuses = require("../../helpers/parkingDB/getParkingTicketStatuses");
exports.handler = (req, res) => {
    return res.json(parkingDB_getParkingTicketStatuses.getParkingTicketStatuses(req.body.ticketID, req.session));
};
