"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const configFns = require("../../helpers/configFns");
const parkingDB_createParkingTicket = require("../../helpers/parkingDB/createParkingTicket");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_createParkingTicket.createParkingTicket(req.body, req.session);
    if (result.success) {
        const ticketNumber = req.body.ticketNumber;
        result.nextTicketNumber = configFns.getProperty("parkingTickets.ticketNumber.nextTicketNumberFn")(ticketNumber);
    }
    return res.json(result);
};
