import { Router } from "express";

import * as configFns from "../helpers/configFns";

import * as usersDB_tryResetPassword from "../helpers/usersDB/tryResetPassword";


const router = Router();


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
    locationClasses: configFns.getProperty("locationClasses"),
    ticketNumber_fieldLabel: configFns.getProperty("parkingTickets.ticketNumber.fieldLabel"),
    parkingTicketStatuses: configFns.getProperty("parkingTicketStatuses"),
    licencePlateCountryAliases: configFns.getProperty("licencePlateCountryAliases"),
    licencePlateProvinceAliases: configFns.getProperty("licencePlateProvinceAliases"),
    licencePlateProvinces: configFns.getProperty("licencePlateProvinces")
  });

});


export = router;
