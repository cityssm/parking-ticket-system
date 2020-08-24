"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_deleteParkingTicketStatus = require("../../helpers/parkingDB/deleteParkingTicketStatus");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_deleteParkingTicketStatus.deleteParkingTicketStatus(req.body.ticketID, req.body.statusIndex, req.session);
    return res.json(result);
};
