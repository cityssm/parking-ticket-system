import { Router } from "express";
const router = Router();

import * as parkingDB from "../helpers/parkingDB";
import * as ontarioParkingDB from "../helpers/parkingDB-ontario";

import * as mtoFns from "../helpers/mtoFns";

import * as pts from "../helpers/ptsTypes";


// Ticket Convictions


router.get("/convict", function(req, res) {

  if (!(req.session.user.userProperties.canUpdate || req.session.user.userProperties.isOperator)) {

    res.redirect("/tickets/?error=accessDenied");
    return;

  }

  const tickets = ontarioParkingDB.getParkingTicketsAvailableForMTOConvictionBatch();

  const batch = parkingDB.getParkingTicketConvictionBatch(-1);

  res.render("mto-ticketConvict", {
    headTitle: "Convict Parking Tickets",
    tickets: tickets,
    batch: batch
  });

});



router.get("/convict/:batchID", function(req, res) {

  if (!(req.session.user.userProperties.canUpdate || req.session.user.userProperties.isOperator)) {
    res.redirect ("/tickets/?error=accessDenied");
    return;
  }

  const batchID = parseInt(req.params.batchID);

  const output = mtoFns.exportConvictionBatch(batchID, req.session);

  res.setHeader("Content-Disposition", "attachment; filename=convictBatch-" + batchID + ".txt");
  res.setHeader("Content-Type", "text/plain");
  res.send(output);

});


router.post("/doRemoveTicketFromConvictionBatch", function(req, res) {

  if (!req.session.user.userProperties.canUpdate) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const batchID = req.body.batchID;
  const ticketID = req.body.ticketID;

  const result: {
    success: boolean,
    message?: string,
    tickets?: pts.ParkingTicket[]
  } = parkingDB.removeParkingTicketFromConvictionBatch(batchID, ticketID, req.session);

  if (result.success) {
    result.tickets = ontarioParkingDB.getParkingTicketsAvailableForMTOConvictionBatch();
  }

  return res.json(result);

});


export = router;
