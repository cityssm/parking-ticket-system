"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingTicketID = require("../../helpers/parkingDB/getParkingTicketID");
exports.handler = (req, res) => {
    const ticketNumber = req.params.ticketNumber;
    const ticketID = parkingDB_getParkingTicketID.getParkingTicketID(ticketNumber);
    if (ticketID) {
        res.redirect("/tickets/" + ticketID.toString());
    }
    else {
        res.redirect("/tickets/?error=ticketNotFound");
    }
};
