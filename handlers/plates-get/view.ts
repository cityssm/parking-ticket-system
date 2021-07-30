import type { RequestHandler } from "express";

import { getAllLicencePlateOwners } from "../../helpers/parkingDB/getAllLicencePlateOwners.js";
import { getParkingTicketsByLicencePlate } from "../../helpers/parkingDB/getParkingTickets.js";


export const handler: RequestHandler = (request, response) => {

  let licencePlateCountry = request.params.licencePlateCountry;

  if (licencePlateCountry === "_") {
    licencePlateCountry = "";
  }

  let licencePlateProvince = request.params.licencePlateProvince;

  if (licencePlateProvince === "_") {
    licencePlateProvince = "";
  }

  let licencePlateNumber = request.params.licencePlateNumber;

  if (licencePlateNumber === "_") {
    licencePlateNumber = "";
  }

  const owners = getAllLicencePlateOwners(licencePlateCountry, licencePlateProvince, licencePlateNumber);

  const tickets =
    getParkingTicketsByLicencePlate(licencePlateCountry, licencePlateProvince, licencePlateNumber,
      request.session);

  response.render("plate-view", {
    headTitle: "Licence Plate " + licencePlateNumber,

    licencePlateNumber,
    licencePlateProvince,
    licencePlateCountry,

    owners,
    tickets
  });
};


export default handler;
