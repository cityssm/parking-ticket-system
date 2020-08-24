"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const parkingDB_getParkingTicket = require("../../helpers/parkingDB/getParkingTicket");
const parkingDB = require("../../helpers/parkingDB");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    const ticketID = parseInt(req.params.ticketID, 10);
    if (!userFns_1.userCanCreate(req)) {
        return res.redirect("/tickets/" + ticketID.toString());
    }
    const ticket = parkingDB_getParkingTicket.getParkingTicket(ticketID, req.session);
    if (!ticket) {
        return res.redirect("/tickets/?error=ticketNotFound");
    }
    else if (!ticket.canUpdate || ticket.resolvedDate || ticket.recordDelete_timeMillis) {
        return res.redirect("/tickets/" + ticketID.toString() + "/?error=accessDenied");
    }
    const vehicleMakeModelDatalist = parkingDB.getRecentParkingTicketVehicleMakeModelValues();
    return res.render("ticket-edit", {
        headTitle: "Ticket " + ticket.ticketNumber,
        isCreate: false,
        ticket,
        issueDateMaxString: dateTimeFns.dateToString(new Date()),
        vehicleMakeModelDatalist
    });
};
