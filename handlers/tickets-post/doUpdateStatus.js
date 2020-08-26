"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_updateParkingTicketStatus = require("../../helpers/parkingDB/updateParkingTicketStatus");
exports.handler = (req, res) => {
    const result = parkingDB_updateParkingTicketStatus.updateParkingTicketStatus(req.body, req.session);
    return res.json(result);
};
