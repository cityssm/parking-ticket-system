"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const configFns = require("../../helpers/configFns");
const parkingDB_createParkingTicket = require("../../helpers/parkingDB/createParkingTicket");
exports.handler = (req, res) => {
    const result = parkingDB_createParkingTicket.createParkingTicket(req.body, req.session);
    if (result.success) {
        const ticketNumber = req.body.ticketNumber;
        result.nextTicketNumber = configFns.getProperty("parkingTickets.ticketNumber.nextTicketNumberFn")(ticketNumber);
    }
    return res.json(result);
};
