"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingTickets = require("../../helpers/parkingDB/getParkingTickets");
exports.handler = (req, res) => {
    const queryOptions = {
        limit: req.body.limit,
        offset: req.body.offset,
        ticketNumber: req.body.ticketNumber,
        licencePlateNumber: req.body.licencePlateNumber,
        location: req.body.location
    };
    if (req.body.isResolved !== "") {
        queryOptions.isResolved = req.body.isResolved === "1";
    }
    res.json(parkingDB_getParkingTickets.getParkingTickets(req.session, queryOptions));
};
