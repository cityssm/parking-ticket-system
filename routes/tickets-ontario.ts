import { Router } from "express";
const router = Router();


// Ticket Convictions


router.get("/convict", function(req, res) {

  if (!req.session.user.userProperties.canUpdate) {

    res.redirect("/tickets/?error=accessDenied");
    return;

  }

  res.render("mto-ticketConvict", {
    headTitle: "Convict Parking Tickets"
  });

});


export = router;
