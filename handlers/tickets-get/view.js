"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingTicket = require("../../helpers/parkingDB/getParkingTicket");
exports.handler = (req, res) => {
    const ticketID = parseInt(req.params.ticketID, 10);
    const ticket = parkingDB_getParkingTicket.getParkingTicket(ticketID, req.session);
    if (!ticket) {
        return res.redirect("/tickets/?error=ticketNotFound");
    }
    else if (ticket.recordDelete_timeMillis && !req.session.user.userProperties.isAdmin) {
        return res.redirect("/tickets/?error=accessDenied");
    }
    return res.render("ticket-view", {
        headTitle: "Ticket " + ticket.ticketNumber,
        ticket
    });
};
