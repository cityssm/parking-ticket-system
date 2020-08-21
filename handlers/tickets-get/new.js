"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const configFns = require("../../helpers/configFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const parkingDB = require("../../helpers/parkingDB");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return res.redirect("/tickets/?error=accessDenied");
    }
    const ticketNumber = req.params.ticketNumber;
    const vehicleMakeModelDatalist = parkingDB.getRecentParkingTicketVehicleMakeModelValues();
    return res.render("ticket-edit", {
        headTitle: "New Ticket",
        isCreate: true,
        ticket: {
            ticketNumber,
            licencePlateCountry: configFns.getProperty("defaults.country"),
            licencePlateProvince: configFns.getProperty("defaults.province")
        },
        issueDateMaxString: dateTimeFns.dateToString(new Date()),
        vehicleMakeModelDatalist
    });
};
