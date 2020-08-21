import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import * as parkingDB from "../../helpers/parkingDB";

import { userCanCreate } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanCreate(req)) {
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
