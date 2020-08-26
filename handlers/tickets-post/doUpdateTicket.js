"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_updateParkingTicket = require("../../helpers/parkingDB/updateParkingTicket");
exports.handler = (req, res) => {
    const result = parkingDB_updateParkingTicket.updateParkingTicket(req.body, req.session);
    return res.json(result);
};
