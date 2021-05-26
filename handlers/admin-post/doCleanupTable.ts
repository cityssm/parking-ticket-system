import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns.js";

import cleanupParkingTicketsTable from "../../helpers/parkingDB/cleanupParkingTicketsTable.js";
import cleanupParkingTicketRemarksTable from "../../helpers/parkingDB/cleanupParkingTicketRemarksTable.js";
import cleanupParkingTicketStatusLog from "../../helpers/parkingDB/cleanupParkingTicketStatusLog.js";

import cleanupLicencePlateOwnersTable from "../../helpers/parkingDB/cleanupLicencePlateOwnersTable.js";

import cleanupParkingBylawsTable from "../../helpers/parkingDB/cleanupParkingBylawsTable.js";
import cleanupParkingLocationsTable from "../../helpers/parkingDB/cleanupParkingLocationsTable.js";
import cleanupParkingOffencesTable from "../../helpers/parkingDB/cleanupParkingOffencesTable.js";


export const handler: RequestHandler = (req, res) => {

  const table = req.body.table;

  const recordDelete_timeMillis =
    Math.min(
      parseInt(req.body.recordDelete_timeMillis, 10),
      Date.now() - (configFns.getProperty("databaseCleanup.windowDays") * 86400 * 1000));

  let success = false;

  switch (table) {

    case "parkingTickets":

      success = cleanupParkingTicketsTable(recordDelete_timeMillis);
      break;

    case "parkingTicketRemarks":

      success = cleanupParkingTicketRemarksTable(recordDelete_timeMillis);
      break;

    case "parkingTicketStatusLog":

      success = cleanupParkingTicketStatusLog(recordDelete_timeMillis);
      break;

    case "licencePlateOwners":

      success = cleanupLicencePlateOwnersTable(recordDelete_timeMillis);
      break;

    case "parkingOffences":

      success = cleanupParkingOffencesTable();
      break;

    case "parkingLocations":

      success = cleanupParkingLocationsTable();
      break;

    case "parkingBylaws":

      success = cleanupParkingBylawsTable();
      break;
  }

  return res.json({ success });
};


export default handler;
