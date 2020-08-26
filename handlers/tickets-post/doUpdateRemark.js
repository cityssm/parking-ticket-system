"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_updateParkingTicketRemark = require("../../helpers/parkingDB/updateParkingTicketRemark");
exports.handler = (req, res) => {
    const result = parkingDB_updateParkingTicketRemark.updateParkingTicketRemark(req.body, req.session);
    return res.json(result);
};
