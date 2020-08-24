"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getAllLicencePlateOwners = require("../../helpers/parkingDB/getAllLicencePlateOwners");
const parkingDB_getParkingTickets = require("../../helpers/parkingDB/getParkingTickets");
exports.handler = (req, res) => {
    let licencePlateCountry = req.params.licencePlateCountry;
    if (licencePlateCountry === "_") {
        licencePlateCountry = "";
    }
    let licencePlateProvince = req.params.licencePlateProvince;
    if (licencePlateProvince === "_") {
        licencePlateProvince = "";
    }
    let licencePlateNumber = req.params.licencePlateNumber;
    if (licencePlateNumber === "_") {
        licencePlateNumber = "";
    }
    const owners = parkingDB_getAllLicencePlateOwners.getAllLicencePlateOwners(licencePlateCountry, licencePlateProvince, licencePlateNumber);
    const tickets = parkingDB_getParkingTickets.getParkingTicketsByLicencePlate(licencePlateCountry, licencePlateProvince, licencePlateNumber, req.session);
    res.render("plate-view", {
        headTitle: "Licence Plate " + licencePlateNumber,
        licencePlateNumber,
        licencePlateProvince,
        licencePlateCountry,
        owners,
        tickets
    });
};
