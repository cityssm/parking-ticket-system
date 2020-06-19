import { Router } from "express";
const router = Router();

import * as parkingDBOntario from "../helpers/parkingDB-ontario";
import * as parkingDBConvict from "../helpers/parkingDB-convict";

import * as mtoFns from "../helpers/mtoFns";

import type * as pts from "../helpers/ptsTypes";


// Ticket Convictions


router.get("/convict", function(req, res) {

  if (!(req.session.user.userProperties.canUpdate || req.session.user.userProperties.isOperator)) {

    res.redirect("/tickets/?error=accessDenied");
    return;

  }

  const tickets = parkingDBOntario.getParkingTicketsAvailableForMTOConvictionBatch();

  const batch = parkingDBConvict.getParkingTicketConvictionBatch(-1);

  res.render("mto-ticketConvict", {
    headTitle: "Convict Parking Tickets",
    tickets,
    batch
  });

});



router.get("/convict/:batchID", function(req, res) {

  if (!(req.session.user.userProperties.canUpdate || req.session.user.userProperties.isOperator)) {
    res.redirect ("/tickets/?error=accessDenied");
    return;
  }

  const batchID = parseInt(req.params.batchID, 10);

  const output = mtoFns.exportConvictionBatch(batchID, req.session);

  res.setHeader("Content-Disposition", "attachment; filename=convictBatch-" + batchID + ".txt");
  res.setHeader("Content-Type", "text/plain");
  res.send(output);

});


router.post("/doAddAllTicketsToConvictionBatch", function(req, res) {

  if (!req.session.user.userProperties.canUpdate) {

    return res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

  }

  const batchID = req.body.batchID;
  const ticketIDs: number[] = req.body.ticketIDs;

  const result: {
    successCount?: number,
    message?: string,
    batch?: pts.ParkingTicketConvictionBatch,
    tickets?: pts.ParkingTicket[]
  } = parkingDBConvict.addAllParkingTicketsToConvictionBatch(batchID, ticketIDs, req.session);

  if (result.successCount > 0) {
    result.batch = parkingDBConvict.getParkingTicketConvictionBatch(batchID);
    result.tickets = parkingDBOntario.getParkingTicketsAvailableForMTOConvictionBatch();
  }

  return res.json(result);

});


router.post("/doClearConvictionBatch", function(req, res) {

  if (!req.session.user.userProperties.canUpdate) {

    return res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

  }

  const batchID = req.body.batchID;

  const result: {
    success: boolean,
    message?: string,
    batch?: pts.ParkingTicketConvictionBatch,
    tickets?: pts.ParkingTicket[]
  } = parkingDBConvict.clearConvictionBatch(batchID, req.session);

  if (result.success) {
    result.batch = parkingDBConvict.getParkingTicketConvictionBatch(batchID);
    result.tickets = parkingDBOntario.getParkingTicketsAvailableForMTOConvictionBatch();
  }

  return res.json(result);

});


router.post("/doRemoveTicketFromConvictionBatch", function(req, res) {

  if (!req.session.user.userProperties.canUpdate) {

    return res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

  }

  const batchID = req.body.batchID;
  const ticketID = req.body.ticketID;

  const result: {
    success: boolean,
    message?: string,
    tickets?: pts.ParkingTicket[]
  } = parkingDBConvict.removeParkingTicketFromConvictionBatch(batchID, ticketID, req.session);

  if (result.success) {
    result.tickets = parkingDBOntario.getParkingTicketsAvailableForMTOConvictionBatch();
  }

  return res.json(result);

});


export = router;
