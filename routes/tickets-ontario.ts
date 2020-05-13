import { Router } from "express";
const router = Router();

import { getParkingTicketsAvailableForMTOConvictionBatch } from "../helpers/parkingDB-ontario";


// Ticket Convictions


router.get("/convict", function(req, res) {

  if (!req.session.user.userProperties.canUpdate) {

    res.redirect("/tickets/?error=accessDenied");
    return;

  }

  const tickets = getParkingTicketsAvailableForMTOConvictionBatch();

  res.render("mto-ticketConvict", {
    headTitle: "Convict Parking Tickets",
    tickets: tickets
  });

});


export = router;
