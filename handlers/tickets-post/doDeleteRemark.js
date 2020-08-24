"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_deleteParkingTicketRemark = require("../../helpers/parkingDB/deleteParkingTicketRemark");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_deleteParkingTicketRemark.deleteParkingTicketRemark(req.body.ticketID, req.body.remarkIndex, req.session);
    return res.json(result);
};
