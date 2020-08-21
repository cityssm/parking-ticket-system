import { Router } from "express";

import * as parkingDBOntario from "../helpers/parkingDB-ontario";

import * as parkingDB_getConvictionBatch from "../helpers/parkingDB/getConvictionBatch";
import * as parkingDB_clearConvictionBatch from "../helpers/parkingDB/clearConvictionBatch";
import * as parkingDB_removeParkingTicketFromConvictionBatch from "../helpers/parkingDB/removeParkingTicketFromConvictionBatch";
import * as parkingDB_addParkingTicketToConvictionBatch from "../helpers/parkingDB/addParkingTicketToConvictionBatch";

import { userCanUpdate, userIsOperator, forbiddenJSON } from "../helpers/userFns";
import * as mtoFns from "../helpers/mtoFns";

import type * as pts from "../helpers/ptsTypes";


const router = Router();


// Ticket Convictions


router.get("/convict", (req, res) => {

  if (!(userCanUpdate(req) || userIsOperator(req))) {

    res.redirect("/tickets/?error=accessDenied");
    return;

  }

  const tickets = parkingDBOntario.getParkingTicketsAvailableForMTOConvictionBatch();

  const batch = parkingDB_getConvictionBatch.getConvictionBatch(-1);

  res.render("mto-ticketConvict", {
    headTitle: "Convict Parking Tickets",
    tickets,
    batch
  });

});


router.get("/convict/:batchID", (req, res) => {

  if (!(userCanUpdate(req) || userIsOperator(req))) {
    return res.redirect("/tickets/?error=accessDenied");
  }

  const batchID = parseInt(req.params.batchID, 10);

  const output = mtoFns.exportConvictionBatch(batchID, req.session);

  res.setHeader("Content-Disposition",
    "attachment; filename=convictBatch-" + batchID.toString() + ".txt");
  res.setHeader("Content-Type", "text/plain");

  res.send(output);

});


router.post("/doAddAllTicketsToConvictionBatch", (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const batchID = req.body.batchID;
  const ticketIDs: number[] = req.body.ticketIDs;

  const result: {
    successCount?: number;
    message?: string;
    batch?: pts.ParkingTicketConvictionBatch;
    tickets?: pts.ParkingTicket[];
  } = parkingDB_addParkingTicketToConvictionBatch.addAllParkingTicketsToConvictionBatch(batchID, ticketIDs, req.session);

  if (result.successCount > 0) {
    result.batch = parkingDB_getConvictionBatch.getConvictionBatch(batchID);
    result.tickets = parkingDBOntario.getParkingTicketsAvailableForMTOConvictionBatch();
  }

  return res.json(result);

});


router.post("/doClearConvictionBatch", (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const batchID = req.body.batchID;

  const result: {
    success: boolean;
    message?: string;
    batch?: pts.ParkingTicketConvictionBatch;
    tickets?: pts.ParkingTicket[];
  } = parkingDB_clearConvictionBatch.clearConvictionBatch(batchID, req.session);

  if (result.success) {
    result.batch = parkingDB_getConvictionBatch.getConvictionBatch(batchID);
    result.tickets = parkingDBOntario.getParkingTicketsAvailableForMTOConvictionBatch();
  }

  return res.json(result);
});


router.post("/doRemoveTicketFromConvictionBatch", (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const batchID = req.body.batchID;
  const ticketID = req.body.ticketID;

  const result: {
    success: boolean;
    message?: string;
    tickets?: pts.ParkingTicket[];
  } = parkingDB_removeParkingTicketFromConvictionBatch.removeParkingTicketFromConvictionBatch(batchID, ticketID, req.session);

  if (result.success) {
    result.tickets = parkingDBOntario.getParkingTicketsAvailableForMTOConvictionBatch();
  }

  return res.json(result);
});


export = router;
