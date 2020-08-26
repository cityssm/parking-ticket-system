"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_createParkingTicketRemark = require("../../helpers/parkingDB/createParkingTicketRemark");
exports.handler = (req, res) => {
    const result = parkingDB_createParkingTicketRemark.createParkingTicketRemark(req.body, req.session);
    return res.json(result);
};
