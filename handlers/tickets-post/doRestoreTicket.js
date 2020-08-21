"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_restoreParkingTicket = require("../../helpers/parkingDB/restoreParkingTicket");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_restoreParkingTicket.restoreParkingTicket(req.body.ticketID, req.session);
    return res.json(result);
};
