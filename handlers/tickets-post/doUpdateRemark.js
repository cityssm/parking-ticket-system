"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_updateParkingTicketRemark = require("../../helpers/parkingDB/updateParkingTicketRemark");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const result = parkingDB_updateParkingTicketRemark.updateParkingTicketRemark(req.body, req.session);
    return res.json(result);
};
