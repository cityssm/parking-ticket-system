import { Router } from "express";

import * as configFunctions from "../helpers/functions.config.js";

import usersDB_tryResetPassword from "../helpers/usersDB/tryResetPassword.js";


export const router = Router();


router.get("/", (_req, res) => {

  res.render("dashboard", {
    headTitle: "Dashboard"
  });

});


router.post("/doChangePassword", (req, res) => {

  const userName = req.session.user.userName;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  const result = usersDB_tryResetPassword.tryResetPassword(userName, oldPassword, newPassword);

  res.json(result);

});


router.all("/doGetDefaultConfigProperties", (_req, res) => {

  res.json({
    locationClasses: configFunctions.getProperty("locationClasses"),
    ticketNumber_fieldLabel: configFunctions.getProperty("parkingTickets.ticketNumber.fieldLabel"),
    parkingTicketStatuses: configFunctions.getProperty("parkingTicketStatuses"),
    licencePlateCountryAliases: configFunctions.getProperty("licencePlateCountryAliases"),
    licencePlateProvinceAliases: configFunctions.getProperty("licencePlateProvinceAliases"),
    licencePlateProvinces: configFunctions.getProperty("licencePlateProvinces")
  });

});


export default router;
