"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_createParkingTicketStatus = require("../../helpers/parkingDB/createParkingTicketStatus");
exports.handler = (req, res) => {
    const result = parkingDB_createParkingTicketStatus.createParkingTicketStatus(req.body, req.session, req.body.resolveTicket === "1");
    return res.json(result);
};
