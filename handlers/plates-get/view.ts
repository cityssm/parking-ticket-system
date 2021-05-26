import type { RequestHandler } from "express";

import getAllLicencePlateOwners from "../../helpers/parkingDB/getAllLicencePlateOwners.js";
import { getParkingTicketsByLicencePlate } from "../../helpers/parkingDB/getParkingTickets.js";


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

  const owners = getAllLicencePlateOwners(licencePlateCountry, licencePlateProvince, licencePlateNumber);

  const tickets =
    getParkingTicketsByLicencePlate(licencePlateCountry, licencePlateProvince, licencePlateNumber,
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


export default handler;
