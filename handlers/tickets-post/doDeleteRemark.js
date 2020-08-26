"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_deleteParkingTicketRemark = require("../../helpers/parkingDB/deleteParkingTicketRemark");
exports.handler = (req, res) => {
    const result = parkingDB_deleteParkingTicketRemark.deleteParkingTicketRemark(req.body.ticketID, req.body.remarkIndex, req.session);
    return res.json(result);
};
