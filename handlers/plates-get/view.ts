import type { RequestHandler } from "express";

import * as parkingDB_getAllLicencePlateOwners from "../../helpers/parkingDB/getAllLicencePlateOwners";
import * as parkingDB_getParkingTickets from "../../helpers/parkingDB/getParkingTickets";


export const handler: RequestHandler = (req, res) => {

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

  const tickets =
    parkingDB_getParkingTickets.getParkingTicketsByLicencePlate(licencePlateCountry, licencePlateProvince, licencePlateNumber,
      req.session);

  res.render("plate-view", {
    headTitle: "Licence Plate " + licencePlateNumber,

    licencePlateNumber,
    licencePlateProvince,
    licencePlateCountry,

    owners,
    tickets
  });
};
